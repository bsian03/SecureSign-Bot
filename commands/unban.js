/* eslint-disable global-require */
const client = require('../index');
const utils = require('../utils');

module.exports = () => {
    client.registerCommand('unban', async (msg, args) => {
        try {
            // eslint-disable-next-line prefer-const
            let cache = require('../userCache');
            const member = utils.search(args.join(' '), msg);
            if (!cache.blacklists.includes(member.id)) return msg.channel.createMessage(`⚠ ${member.username}#${member.discriminator} is not blacklisted`);
            cache.blacklists = cache.blacklists.filter(u => u !== member.id);
            return msg.channel.createMessage(`${member.username}#${member.discriminator} is no longer blacklisted`);
        } catch (error) {
            return utils.err(error.stack);
        }
    }, {
        dmOnly: false,
        description: 'Unblacklist a user from SecureSign commands',
        fullDescription: 'Unblacklist a user from SecureSign commands',
        hidden: true,
        requirements: {
            userIDs: ['253600545972027394'],
            roleIDs: ['475817826251440128', '525441307037007902', '521312697896271873'],
        },
    });
};
