import { readAppInfo } from 'binary-vdf';
import getSteamBuilds from '.';
import Promise from 'bluebird';
var fs = Promise.promisifyAll(require("fs"));
let games = [{ appid: 326160 }, { appid: 252210 }];

getSteamBuilds(games).then((appinfo) => {

    return readAppInfo(appinfo).then((pBuilds) => {
        return fs.writeFileAsync('steamBuilds.json', JSON.stringify(pBuilds))
            .then(() => {
                console.log('Steam information saved as steamBuilds.json');
                process.exit();
            });
    });

}).catch(e => {
    console.log(e);

});