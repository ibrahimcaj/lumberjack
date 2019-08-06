/**
 * @license
 * Copyright (c) 2019 vanished
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

const {getHelpEmbed} = require("../../HelpInformation.js");
const Discord = require("discord.js");
const {handleError} = require("../../utility/discord/MessageUtilities.js");
const {
    t,
    unwrap
} = require("../../utility/Type.js");
const Help = require("../Help.js");

function run(client, message, args) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const handle = error => handleError(error, message);
    const channel = message.channel;

    if (args.length) {
        const command = client.commands.get(args[0].toLowerCase());
        if (command) {
            return channel.send(getHelpEmbed(command.help)).catch(handle);
        }
    }

    getHelpEmbed(client).send(channel).then(results => results.filter(result => t(result, Error)).forEach(handle));
}

module.exports = {
    run,
    help: new Help("help", "It's just a list of my commands.")
        .addSubCommands(new Help("<command>", "Get more detailed information about a command."))
};
