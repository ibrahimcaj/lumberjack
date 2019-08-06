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

const Discord = require("discord.js");
const {code} = require("../../utility/MarkdownUtilities.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const {Emotes} = require("../../Constants.js");
const {
    t,
    unwrap
} = require("../../utility/Type.js");
const Help = require("../Help.js");
const Syntax = require("../Syntax.js");
const {isDeveloper} = require("../../Config.js");

function run(client, message, args) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const handle = error => MessageUtilities.handleError(error, message);
    const channel = message.channel;
    const author = message.author;
    const errorEmbed = MessageUtilities.errorRichEmbed(author);
    let commandName;

    if (!isDeveloper(author)) {
        errorEmbed.setTitle("You're not a project developer")
        .setDescription("You need to be a developer of Lumberjack to use this command!");

    } else if (!args.length) {
        errorEmbed.setTitle("Need more arguments").setDescription("You must provide a command name to reload!");

    } else {
        commandName = args[0].toLowerCase();
        if (!client.commands.has(commandName)) {
            errorEmbed.setTitle("Unknown command").setDescription("The command does not exist!");
        }
    }

    if (errorEmbed.title !== undefined) {
        return channel.send(errorEmbed).catch(handle);
    }

    const filePath = client.commands.get(commandName).path;
    delete require.cache[require.resolve(filePath)];
    const command = require(filePath);
    client.commands.set(commandName, {
        run: command.run,
        help: command.help,
        path: filePath
    });

    channel.send(MessageUtilities.richEmbed(author).setTitle("Command reloaded")
        .setThumbnail(MessageUtilities.getEmojiUrl(Emotes.TICK))
        .setDescription(`The command ${code(commandName)} has been reloaded.`)).catch(handle);
}

module.exports = {
    run,
    help: new Help("reload", "Reloads a command.", false).setSyntax(new Syntax().required("command"))
};
