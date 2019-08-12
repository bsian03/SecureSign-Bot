/* eslint-disable consistent-return */
/* eslint-disable no-inner-declarations */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable global-require */
/* eslint-disable max-len */
/* eslint-disable no-useless-return */
/* eslint-disable no-underscore-dangle */
const client = require('../index');
const utils = require('../utils');

module.exports = () => {
    let initing = [];
    client.registerCommand('init', async (msg, args) => {
        try {
            if (initing.includes(msg.author.id)) return;
            const userConfig = require('../userCache');
            // eslint-disable-next-line prefer-const
            if (userConfig.blacklists.includes(msg.author.id)) return;
            if (msg.channel.type !== 1) {
                if (args[0]) msg.delete();
                msg.channel.createMessage('Run this command in your DMs!');
                return;
            }
            let msgShown = 'Initializing SecureSign Account';
            if (userConfig.accounts[msg.author.id]) msgShown = 'Updating SecureSign Account';
            let hash;
            let message;
            if (args[0]) {
                initing.push(msg.author.id);
                hash = args[0];
                message = await msg.channel.createMessage(msgShown);
            } else {
                initing.push(msg.author.id);
                let isActive = true;
                async function timeout(question, choices = null) {
                    if (!isActive) return;
                    const timeoutPromise = new Promise(async (resolve, reject) => {
                        await msg.channel.createMessage(question);
                        let mess = client.on('messageCreate', (mesg) => {
                            if (mesg.author.bot || mesg.channel.type !== 1 || msg.author.id !== mesg.author.id || !mess) return;
                            // eslint-disable-next-line no-unused-expressions
                            const verif = choices ? choices.includes(mesg.content) : mesg.content;
                            if (verif) {
                                // eslint-disable-next-line no-param-reassign
                                mess = undefined;
                                resolve(mesg.content);
                                return;
                                // eslint-disable-next-line no-else-return
                            } else msg.channel.createMessage('Invalid input');
                            return;
                        });
                        // eslint-disable-next-line arrow-body-style
                        setTimeout(() => {
                            mess = undefined;
                            return reject(new Error('Request cancelled due to inactivity'));
                        }, 600000);
                        if (!mess) return;
                        return;
                    });
                    return timeoutPromise;
                }
                function timedOut(error) {
                    msg.channel.createMessage(error.message);
                    initing = initing.filter(u => u !== msg.author.id);
                    isActive = false;
                }
                let check;
                try {
                    check = await timeout('Do you want to initialize with:\n`1` - Your SecureSign hash\n`2` - Your SecureSign username and password', ['1', '2']);
                } catch (error) {
                    return timedOut(error);
                }
                if (check === '1') {
                    try {
                        hash = await timeout('Please enter your SecureSign hash');
                        message = await msg.channel.createMessage(msgShown);
                    } catch (error) {
                        return timedOut(error.message);
                    }
                } else {
                    let username; let password;
                    try {
                        username = await timeout('Please enter your SecureSign username');
                    } catch (error) {
                        return timedOut(error);
                    }
                    try {
                        password = await timeout('Please enter your SecureSign password\nYour password will not be saved, but to be extra safe, please delete your message');
                    } catch (error) {
                        return timedOut(error);
                    }
                    message = await msg.channel.createMessage(msgShown);
                    try {
                        hash = await utils.getSecureSignHash(username, password);
                    } catch (error) {
                        isActive = false;
                        initing = initing.filter(u => u !== msg.author.id);
                        return message.edit(`<:error:477698393754304513> ${error.message}`);
                    }
                    username = undefined; password = undefined;
                }
                isActive = false;
            }
            let initInfo;
            try {
                initInfo = await utils.init(hash, msg);
            } catch (error) {
                initing = initing.filter(u => u !== msg.author.id);
                return message.edit(`<:error:477698393754304513> ${error.message}`);
            }
            hash = undefined;
            initing = initing.filter(u => u !== msg.author.id);
            message.edit({
                content: '',
                embed: {
                    title: 'SecureSign account initialization',
                    description: 'Your account initialization has been saved',
                    fields: [
                        { name: 'Username', value: initInfo.username, inline: true },
                        { name: 'ID', value: initInfo.id, inline: true },
                        { name: 'Email', value: initInfo.email, inline: true },
                        { name: 'Class', value: initInfo.class, inline: true },
                        { name: 'Issued Certs', value: initInfo.total, inline: true },
                        { name: 'Allowed Certs', value: initInfo.allowed, inline: true },
                        { name: 'Organization', value: initInfo.org, inline: true },
                        { name: 'Promos allowed', value: initInfo.promo ? 'Yes' : 'No', inline: true },
                    ],
                    thumbnail: { url: client.user.avatarURL },
                    author: { icon_url: msg.author.avatarURL, name: `${msg.author.username}#${msg.author.discriminator}` },
                    footer: { icon_url: client.user.avatarURL, text: `${client.user.username}` },
                },
            });
        } catch (error) {
            initing = initing.filter(u => u !== msg.author.id);
            msg.channel.createMessage('<:error:477698393754304513> An unknown error occured');
            utils.err(error.stack);
        }
    }, {
        description: 'Initialize SecureSign (DM only)',
        fullDescription: 'Initialize SecureSign (DM only)',
    });
};
