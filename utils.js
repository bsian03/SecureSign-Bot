/* eslint-disable no-underscore-dangle */
/* eslint-disable no-useless-return */
/* eslint-disable max-len */
/* eslint-disable global-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
const fs = require('fs');
const axios = require('axios');
const client = require('./index');

const baseURL = 'https://api.securesign.org';

module.exports = {
    async blacklist(reason, message, id) {
        const userConfig = require('./userConfig.json');
        const pings = require('./pings.json').map(u => `<@${u}>`).join(' ');
        await client.getChannel('501089664040697858').createMessage(`${pings} __**${reason.toUpperCase()} ALERT**__\n${message}. They have been blacklisted from using the SecureSign commands.`);
        if (userConfig.blacklists.includes(id)) return;
        userConfig.blacklists.push(id);
        const toSave = JSON.stringify(userConfig);
        try {
            fs.writeFileSync('./userConfig.json', toSave);
        } catch (error) {
            this.err(error.stack);
        }
    },
    err(stack) {
        client.getChannel('595788220764127272').createMessage(`\`\`\`js\n${stack}\n\`\`\``);
    },
    async init(hash, msg) {
        const cache = require('./userCache');
        let verify;
        try {
            verify = await axios({
                method: 'get',
                url: `${baseURL}/account/details`,
                // eslint-disable-next-line quote-props
                headers: { 'Authorization': hash },
            });
        } catch (error) {
            const { status } = error.response;
            if (status === 400 || status === 401 || status === 403 || status === 404) {
                return Promise.reject(new Error('Credentials Incorrect'));
            }
            this.err(error.stack);
            return Promise.reject(new Error('An unknown error occurred'));
        }
        verify = verify.data.message;
        if (verify.id !== msg.author.id) {
            await this.blacklist('unauthorized access', `${msg.author.mention} tried to authenticate their account using <@${verify.id}>'s credentials`, msg.author.id);
            return Promise.reject(new Error('Credentials Incorrect'));
        }
        delete verify._id;
        delete verify.password;
        cache.accounts[msg.author.id] = verify;
        let vmAcct;
        try {
            vmAcct = await this.findVMAccount(verify.id);
        } catch (error) {
            vmAcct = {};
        }
        cache.accounts[msg.author.id].vmAccount = vmAcct;
        const toSave = JSON.stringify(cache);
        try {
            fs.writeFileSync('./userConfig.json', toSave);
        } catch (error) {
            this.err(error.stack);
            return Promise.reject(new Error('Failed to save configuration'));
        }
        return Promise.resolve(cache.accounts[msg.author.id]);
    },
    async findVMAccount(id) {
        try {
            const exec = require('child_process').execSync;
            let users;
            try {
                users = await exec('cat /etc/passwd').toString();
            } catch (error) {
                this.err(error.stack);
                return Promise.reject(new Error('An unknown error occured'));
            }
            users = users.split('\n').map(a => a.split(':'));
            const foundUser = users.find(u => u[4].split(',')[1] === id);
            if (!foundUser) return Promise.reject(new Error('No user found'));
            const obj = {
                accountName: foundUser[0],
                userName: foundUser[4].split(',')[0],
                roomNumber: foundUser[4].split(',')[1],
                homeDir: foundUser[5],
                shell: foundUser[6],
            };
            return Promise.resolve(obj);
        } catch (error) {
            this.err(error.stack);
            return Promise.reject(new Error('An unknown error occured'));
        }
    },
    async getSecureSignHash(username, password) {
        const auth = JSON.stringify({ username, password });
        try {
            const { data } = await axios({
                method: 'get',
                url: 'https://api.securesign.org/account/bearer',
                headers: { 'Content-Type': 'application/json' },
                data: auth,
            });
            return Promise.resolve(data.message);
        } catch (error) {
            const { status } = error.response;
            if (status === 400 || status === 401 || status === 403 || status === 404) {
                return Promise.reject(new Error('Authentication failed'));
            }
            this.err(error.stack);
            return Promise.reject(new Error('An unknown error occured'));
        }
    },
    async abuse(id) {
        const cache = require('./userCache');
        if (!cache.abuseCounter[id] || !cache.abuseCounter[id][0]) cache.abuseCounter[id] = [Date.now()];
        else {
            const array = cache.abuseCounter[id]; array.push(Date.now()); cache.abuseCounter[id] = array;
        }
        if (cache.abuseCounter[id][2]) {
            this.blacklist('abuse', `<@${id}> tried to authenticate 3 times within 5 minutes`, id);
        }
    },
    search(search, msg) {
        if (!search) {
            if (msg) msg.channel.createMessage('Please enter a user');
            return undefined;
        }
        const guild = client.guilds.get('446067825673633794');
        let member = guild.members.find(user => `${user.username}#${user.discriminator}` === search || user.username === search || user.id === search || (msg.mentions[0] && user.id === msg.mentions[0].id) || (user.nick !== undefined && user.nick === search));
        if (!member) guild.members.find(user => `${user.username.toLowerCase()}#${user.discriminator}` === search.toLowerCase() || user.username.toLowerCase() === search.toLowerCase() || (user.nick !== null && user.nick.toLowerCase() === search.toLowerCase()));
        if (!member) member = guild.members.find(user => user.username.toLowerCase().includes(search.toLowerCase()) || (user.nick !== undefined && user.nick.toLowerCase().includes(search.toLowerCase())));
        if (member) return member;
        if (msg) msg.channel.createMessage(`I could not find ${search}`);
        return undefined;
    },
    split(output, length) {
        const msgArray = [];
        if (!output) {
            return [];
        }
        if (Array.isArray(output)) {
            // eslint-disable-next-line no-param-reassign
            output = output.join('\n');
        }
        if (output.length > length) {
            let str = '';
            let pos;
            while (output.length > 0) {
                pos = output.length > length ? output.lastIndexOf('\n', length) : output.length;
                if (pos > length) {
                    pos = length;
                }
                str = output.substr(0, pos);
                // eslint-disable-next-line no-param-reassign
                output = output.substr(pos);
                msgArray.push(str);
            }
        } else {
            msgArray.push(output);
        }
        return msgArray;
    },
};
