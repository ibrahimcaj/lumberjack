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

const {retrieve} = require("../../Database.js");
const {Emotes} = require("../../Constants.js");
const Discord = require("discord.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const {resolveUserRecursively} = require("../../utility/discord/UserUtilities.js");
const {
    t,
    unwrap
} = require("../../utility/Type.js");
const Help = require("../Help.js");

async function run(client, message, args) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const handle = error => MessageUtilities.handleError(error, message);
    const channel = message.channel;
    const content = message.content;
    const author = message.author;
    const errorEmbed = MessageUtilities.errorRichEmbed(author);

    let discordUser;
    if (args.length) {

        const mentionedUsers = await resolveUserRecursively(content.substring(content.indexOf(args[0])), client);
        const mentionedNonBots = mentionedUsers.filter(user => !user.bot);
        const nonBotsLength = mentionedNonBots.length;

        if (mentionedUsers.length && !nonBotsLength) {
            errorEmbed.setTitle("Beep Boop")
            .setDescription("You can't peek at bots' pockets, they aren't supposed to be able to play the game.");
        } else if (nonBotsLength === 1) {
            discordUser = mentionedNonBots[0];
        } else if (nonBotsLength > 1) {
            errorEmbed.setTitle("Ambiguous user").setDescription("Please be more specific about the targeted user.");
        }
    }

    if (errorEmbed.title !== undefined) {
        return channel.send(errorEmbed).catch(handle);
    }

    const getEmbed = user => MessageUtilities.richEmbed(author)
        .setThumbnail(MessageUtilities.getEmojiUrl(Emotes.BILL)).setDescription(`Balance: ${user.money} coins.`);

    discordUser ?

        retrieve(discordUser.id, true).then(user => channel.send(user ?
            getEmbed(user).setTitle(`${discordUser.username}'s balance`) :
            errorEmbed.setTitle("No data").setDescription("The user has not started playing yet."))).catch(handle) :

        retrieve(author.id).then(user => channel.send(getEmbed(user).setTitle("Balance"))).catch(handle);
}

module.exports = {
    run,
    help: new Help("balance", "Take a peek at your wallet.")
        .addSubCommands(new Help("<user>", "Take a peek at someone else's wallet. Don't be caught."))
};
