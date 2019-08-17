/* eslint-disable no-eval */
/* eslint-disable global-require */
const Gists = require('gists');
const client = require('../index');
const utils = require('../utils');

const gists = new Gists({ username: 'bsian03', password: 'CYMHarrynim123' });

module.exports = () => {
    // eslint-disable-next-line consistent-return
    client.registerCommand('eval', async (msg) => {
        try {
            let output;
            const evalCode = msg.content.split(' ').slice(1).join(' ');
            try {
                output = await eval(evalCode);
                // eslint-disable-next-line no-nested-ternary
                if (typeof (output) !== 'string') output = output && require('util').inspect(output, { depth: 2 }).length < 1950 ? require('util').inspect(output, { depth: 2 }) : require('util').inspect(output, { depth: 1 }).length < 1950 ? require('util').inspect(output, { depth: 1 }) : require('util').inspect(output, { depth: 0 });
            } catch (error) {
                output = error.stack;
            }
            if (output) output = output.replace(client.token, 'no u');
            output = utils.split(output, 1950, msg);
            if (output[5]) {
                let overflow;
                try {
                    overflow = await gists.create({
                        description: 'JavaScript Evaluation Output Overflow',
                        public: false,
                        files: {
                            'evaluation.js': {
                                content: output.join('\n'),
                            },
                        },
                    });
                } catch (error) {
                    return `Your evaluation was too large for rate limits to handle\n<:RedTick:276107398349979650> An error occured when uploading output:\n${error}`;
                }
                return `Your evaluation was too large for rate limits to handle\nThe output is on <${overflow.body.html_url}>`;
            }
            output.forEach(Message => msg.channel.createMessage(`\`\`\`js\n${Message}\n\`\`\``));
        } catch (error) {
            utils.err(error.stack, msg);
        }
    }, {
        dmOnly: false,
        description: 'Ping the bot',
        fullDescription: 'Ping the bot',
    });
};
