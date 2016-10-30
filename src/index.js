
import fs from 'fs';
import { spawn } from 'child_process';
import Promise from 'bluebird';

const HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const APPINFO_PATH = `${HOME}/Steam/appcache/appinfo.vdf`;
var previousTime;
var steamcmd;

export default function getSteamBuilds(apps) {
    console.log('Deleting existing appinfo.vdf file'); 
    if (fs.existsSync(APPINFO_PATH)) {
        fs.unlinkSync(APPINFO_PATH);
    }

    steamcmd = spawn('./steamcmd.sh', ['+login anonymous', '+app_info_update 1']);

    steamcmd.on('error', (err) => {
        console.log('Failed to start child process.');
        process.exit(1);
    });

    steamcmd.on("exit", function (exitCode) {
        console.log('process exited with code ' + exitCode);
    });

    return checkFileExist()
        .then(() => {
            return requestBuilds(apps)
                .then(() => {
                    return new Promise((resolve, reject) => {
                        (function checkFileChanged() {
                            console.log('waiting for steamcmd to populate appinfo.vdf before returning results'); 
                            //give steamcmd some time to populate the appinfo.vdf file
                            setTimeout(function () {
                                let file = fs.statSync(APPINFO_PATH);
                                let currentTime = file.mtime.getTime();
                                if (currentTime > previousTime) {
                                    var readStream = fs.createReadStream(APPINFO_PATH);
                                    readStream.on('open', function () {
                                        console.log('sending appinfo.vdf content'); 
                                        resolve(readStream);
                                    });
                                } else {
                                    checkFileChanged();
                                }
                            }, 5000)
                        })();
                    })
                })
        });

}


function checkFileExist() {
    return new Promise((resolve, reject) => {
        (function checkExistLoop() {
            setTimeout(function () {
                if (fs.existsSync(APPINFO_PATH)) {
                    console.log('appinfo.vdf file created, sending requests'); 
                    let file = fs.statSync(APPINFO_PATH);
                    resolve();
                } else {
                    console.log('waiting for appinfo.vdf file to be created by steamcmd...');
                    checkExistLoop();
                }

            }, 5000)
        })();
    })
}


function requestBuilds(apps) {
    return Promise.reduce(apps, function (total, app, index, length) {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                if (index === length - 1) {
                    let file = fs.statSync(APPINFO_PATH);
                    previousTime = file.mtime.getTime();
                }
                console.log(`sending request for app ${index + 1} of ${length}`);
                steamcmd.stdin.write('app_info_print ' + app.appid + '\n');
                resolve();
            }, 1000)
        });
    }, Promise.resolve());


}


