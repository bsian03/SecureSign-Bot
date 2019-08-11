/* eslint-disable max-len */
/* eslint-disable global-require */
const fs = require('fs');
const core = require('./userConfig.json');

// eslint-disable-next-line prefer-const
let cache = core; let { abuseCounter, blacklists } = cache;
setInterval(() => {
    cache.blacklists = blacklists;
    const entries = Object.entries(abuseCounter);
    if (!entries[0]) return;
    const filtered = entries.filter(abuser => abuser[1].filter(e => e + (5 * 60 * 1000) >= Date.now())[0]);
    if (!filtered[0]) {
        abuseCounter = {};
        cache.abuseCounter = {};
    }
    filtered.forEach((u) => {
        const key = u[0];
        const value = u[1];
        abuseCounter[key] = value;
    });
    const jsonCore = JSON.stringify(core);
    const jsonCache = JSON.stringify(cache);
    if (jsonCore !== jsonCache) {
        fs.writeFileSync('./userConfig.json', jsonCache);
    }
}, 1000);
module.exports = cache;
