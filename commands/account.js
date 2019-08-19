/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
const client = require('../');
const utils = require('../utils');

module.exports = () => {
    client.registerCommand('account', async (msg, args) => {
        try {
            // eslint-disable-next-line global-require
            const userConfig = require('../userCache');
            if (userConfig.blacklists.includes(msg.author.id)) return;
            const { roles } = client.guilds.get('446067825673633794').members.get(msg.author.id);
            if (msg.channel.type !== 1 && (!roles.includes('475817826251440128') || !roles.includes('525441307037007902') || !roles.includes('521312697896271873') || !roles.includes('528728911668969472'))) return msg.channel.createMessage('Please run this command in your DMs. Roles');
            if (!args[0] && msg.channel.type !== 1) return msg.channel.createMessage('Please run this command in your DMs. Args');
            let id;
            let hash;
            if (msg.channel.type === 1) id = msg.author.id;
            else {
                const user = utils.membersearch(args.join(' '));
                if (!user) hash = args[1];
                else {
                    id = user.id;
                    const regAcct = userConfig.accounts[id];
                    if (!regAcct) return msg.channel.createMessage("Couldn't find user account");
                    hash = regAcct.hash;
                }
            }
            const message = await msg.channel.createMessage('Fetching account details...');
            let account;
            try {
                account = await utils.account(id, hash);
            } catch (error) {
                return message.edit(`<:error:477698393754304513> ${error.message}`);
            }
            const fields = [
                { name: 'Username', value: account.username, inline: true },
                { name: 'ID', value: account.id, inline: true },
                { name: 'Email', value: account.email, inline: true },
                { name: 'Class', value: account.class, inline: true },
                { name: 'Issued Certs', value: account.total, inline: true },
                { name: 'Allowed Certs', value: account.allowed, inline: true },
                { name: 'Organization', value: account.org, inline: true },
                { name: 'Promos allowed', value: account.promo ? 'Yes' : 'No', inline: true },
            ];
            let vmAcct;
            try {
                vmAcct = await utils.findVMAccount(id);
                fields.push.apply(fields, [
                    { name: 'VM Account name', value: vmAcct.accountName, inline: true },
                    { name: 'VM username', value: vmAcct.userName, inline: true },
                    { name: 'Home directory', value: vmAcct.homeDir, inline: true },
                    { name: 'Shell', value: vmAcct.shell, inline: true },
                ]);
            // eslint-disable-next-line no-empty
            } catch (error) {}
            return message.edit({
                content: '',
                embed: {
                    title: 'SecureSign Account',
                    description: 'Here are some of your account info',
                    fields,
                    thumbnail: { url: client.user.avatarURL },
                    author: { icon_url: msg.author.avatarURL, name: `${msg.author.username}#${msg.author.discriminator}` },
                    footer: { icon_url: client.user.avatarURL, text: `${client.user.username}` },
                },
            });
        } catch (error) {
            utils.err(error.stack);
            return msg.channel.createMessage('An unknown error occured');
        }
    }, {
        cooldown: 30000,
        description: 'View Securesign Account details (DM only)',
        fullDescription: 'View Securesign Account details (DM only)',
        cooldownExclusions: {
            channelIDs: ['464982080976322560', '608099041275805746', '466086525927424000'],
            userIDs: ['253600545972027394', '155698776512790528', '278620217221971968'],
        },
    });
};
