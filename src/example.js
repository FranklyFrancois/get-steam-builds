import { readAppInfo } from 'binary-vdf';
import getSteamBuilds from '.';

let games = [{ appid: 326160 }, { appid: 252210 }];

getSteamBuilds(games).then((appinfo) => {

    readAppInfo(appinfo).then((pBuilds) => {
        console.log(pBuilds);
        //here's your json object with the build info; 
    });

}).catch(e => {
    console.log(e);

});