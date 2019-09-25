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

const {fixData} = require("../../Database.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const Discord = require("discord.js");
const Help = require("../Help.js");
const {isDeveloper} = require("../../Config.js");
const {
    t,
    unwrap
} = require("../../utility/Type.js");

async function run(client, message, args) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const handle = error => MessageUtilities.handleError(error, message);
    const content = message.content;
    const author = message.author;
    const channel = message.channel;
    const errorEmbed = MessageUtilities.errorRichEmbed(author);

    if (!isDeveloper(author)) {
        return channel.send(errorEmbed.setTitle("You're not a project developer")
            .setDescription("You need to be a developer of Lumberjack to use this command!")).catch(handle);
    }

    let id;
    if (args.length) {

        const mentionedUsers = await client.userResolver
            .resolveUser(content.substring(content.indexOf(args[0])), client, client.userResolver.newOption({recursive: true}));
        const mentionedNonBots = mentionedUsers.filter(user => !user.bot);
        const nonBotsLength = mentionedNonBots.length;

        if (mentionedUsers.length && !nonBotsLength) {
            errorEmbed.setTitle("Beep Boop")
            .setDescription("You can't fix data for bots, they aren't supposed to be able to play the game.");
        } else if (nonBotsLength === 1) {
            id = mentionedNonBots[0].id;
        } else if (nonBotsLength > 1) {
            errorEmbed.setTitle("Ambiguous user").setDescription("Please be more specific about the targeted user.");
        }
    }

    if (errorEmbed.title !== undefined) {
        return channel.send(errorEmbed).catch(handle);
    }

    let description = "Examined and fixed data in the database, 0 successes and 1 failures.";

    fixData(id).then(results => {

        if (Array.isArray(results)) {
            const errorsLength = results.filter(result => t(result, Error)).length;
            description = description.replace("1", errorsLength).replace("0", results.length - errorsLength);
        } else {
            description = description.replace("1", "0").replace("0", "1");
        }

    }).catch(error => description += `\n\n${error}`).finally(() => channel.send(MessageUtilities.richEmbed(author)
        .setThumbnail(MessageUtilities.getEmojiUrl("\ud83d\udd27")).setDescription(description))).catch(handle);
}

module.exports = {
    run,
    help: new Help("fixdata", "Examine and fix corrupted data for all users in the database.", false)
        .addSubCommands(new Help("<user>", "Examine and fix corrupted data for specified user in the database."))
};
