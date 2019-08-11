/* eslint-disable no-console */
const client = require('../index');

module.exports = () => {
    client.registerCommand('ping', async (msg) => {
        try {
            const start = Date.now();
            const message = await msg.channel.createMessage('Pong!');
            message.edit(`Pong! \`${Date.now() - start}ms\``);
        } catch (error) {
            console.error(error.stack);
        }
    }, {
        dmOnly: false,
        description: 'Ping the bot',
        fullDescription: 'Ping the bot',
    });
};
