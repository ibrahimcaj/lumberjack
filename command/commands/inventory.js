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
const {getAllTypes} = require("../../utility/ItemUtilities.js");
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
            .setDescription("You can't check bots' bags, they aren't supposed to be able to play the game.");
        } else if (nonBotsLength === 1) {
            discordUser = mentionedNonBots[0];
        } else if (nonBotsLength > 1) {
            errorEmbed.setTitle("Ambiguous user").setDescription("Please be more specific about the targeted user.");
        }
    }

    if (errorEmbed.title !== undefined) {
        return channel.send(errorEmbed).catch(handle);
    }

    const getEmbed = user => {

        const inventory = user.inventory;
        const inventoryAsArray = Array.from(inventory).filter(item => item.isValid());
        const multiEmbed = MessageUtilities.multiRichEmbed(author)
            .setThumbnail(MessageUtilities.getEmojiUrl("\ud83d\udcbc"))
            .setDescription(`${Emotes.COIN} Balance: ${user.money} coins.\n\ud83d\udce6 Types of item: ${
                Object.values(getAllTypes()).filter(Type => inventory.count(Type)).length}`);

        inventoryAsArray.filter(item => !item.durability).forEach(item => {

            const details = item.getItemDetails();
            const fieldName = `${details.emote} ${details.friendlyName}`;

            if (multiEmbed.fields.some(field => field.name === fieldName)) {
                return;
            }
            multiEmbed.addField(fieldName, `Amount: ${inventory.count(item.constructor)}`);
        });

        inventoryAsArray.filter(item => item.durability && !item.isBroken()).forEach(item => {
            const details = item.getItemDetails();
            multiEmbed.addField(`${details.emote} ${details.friendlyName}`, `Durability: ${item.durability}`);
        });

        return MessageUtilities.ensureEmbedNotEmpty(multiEmbed, "items");
    };

    const multiHandle = results => results.filter(result => t(result, Error)).forEach(handle);
    discordUser ?
        retrieve(discordUser.id, true).then(user => user ?

            getEmbed(user).setTitle(`${Discord.escapeMarkdown(discordUser.username)}'s inventory`).send(channel).then(multiHandle) :
            channel.send(errorEmbed.setTitle("No data").setDescription("The user has not started playing yet."))).catch(handle) :

        retrieve(author.id).then(user => getEmbed(user).setTitle("Inventory").send(channel).then(multiHandle), handle);
}

module.exports = {
    run,
    help: new Help("inventory", "Check out what is in your bag.")
        .addSubCommands(new Help("<user>", "Check out what is in someone else's bag. Sneaky..."))
};
