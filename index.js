/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable global-require */
/* eslint-disable no-useless-return */
/* eslint-disable no-console */
/* eslint-disable prefer-const */
const { CommandClient } = require('eris');
const fs = require('fs');
let { bot } = require('./botConfig.json');

bot.commandOptions.defaultCommandOptions.cooldownMessage = async (message) => {
    const msg = await message.channel.createMessage(`${message.author.mention} You're using commands too quickly! Slow down.`);
    setTimeout(() => {
        msg.delete();
    }, 5000);
};
const client = new CommandClient(bot.token, bot.options, bot.commandOptions);
module.exports = client;

client.on('ready', async () => {
    console.log(client);
});

const __cmddir = fs.readdirSync(`${__dirname}/commands`);
for (const cmdFile of __cmddir) {
    const fileName = cmdFile.split('.').slice(0, cmdFile.split('.').length - 1).join('.');
    const command = `./commands/${fileName}`;
    // eslint-disable-next-line import/no-dynamic-require
    require(command)();
}
client.connect();
