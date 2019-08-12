/* eslint-disable consistent-return */
/* eslint-disable global-require */
const client = require('../index');
const utils = require('../utils');

module.exports = () => {
    client.registerCommand('unban', async (msg, args) => {
        console.log('Command recieved');
        try {
            // eslint-disable-next-line prefer-const
            let cache = require('../userCache');
            const member = utils.search(args.join(' '), msg);
            if (!member) return;
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
            custom: (msg) => {
                if (msg.member.id === '253600545972027394') return true; // Bsian
                if (msg.member.roles.includes('475817826251440128')) return true; // Community Management
                if (msg.member.roles.includes('525441307037007902')) return true; // Engineering Team
                if (msg.member.roles.includes('521312697896271873')) return true; // Community Supervisor
                return false;
            },
        },
    });
};
