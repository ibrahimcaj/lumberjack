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

const MessageUtilities = require("./utility/discord/MessageUtilities.js");
const {getHelpEmbed} = require("./HelpInformation.js");
const Discord = require("discord.js");
const {t} = require("./utility/Type.js");

const PREFIX = require("./config.json").prefix;

function respond(client, message) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    if (!client.readyAt) {
        throw new Error("Client is not ready yet");
    }

    const channel = message.channel;
    if (channel.type !== "dm") {
        throw new Error("repond only accepts messages from DMChannels!");
    }

    if (message.author.bot) {
        return Promise.resolve();
    }

    let content = message.content;
    if (content.startsWith(PREFIX)) {
        content = content.substring(PREFIX.length);
    }

    let args = content.split(/\s+/g);
    if (args.length && args[0].toLowerCase() === "help") {
        args = args.slice(1);
    }

    let commandHelp;
    if (args.length) {
        const command = client.commands.get(args[0].toLowerCase());
        if (command) {
            commandHelp = command.help;
        }
    }

    const handle = error => MessageUtilities.handleError(error, message);
    const embed = getHelpEmbed(commandHelp ? commandHelp : client);

    return commandHelp ?
        channel.send(embed).catch(handle).then(result => !!result) :
        embed.send(channel).then(results => {
            const errors = results.filter(result => t(result, Error));
            errors.forEach(handle);
            return !errors.length;
        });
}

module.exports = {
    respond
};
