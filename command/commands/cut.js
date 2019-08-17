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

const Database = require("../../Database.js");
const {Message} = require("discord.js");
const {sGetItemDetails} = require("../../game/item/Item.js");
const {WoodLog} = require("../../game/item/CommonItems.js");
const {code} = require("../../utility/MarkdownUtilities.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const {t} = require("../../utility/Type.js");
const Help = require("../Help.js");
const random = require("random-value-generator");

const cooldownMap = new Map();
const Time = {
    COOLDOWN: 300,
    COLLECTOR: 10,
    REDUCED_REWARD: 3
};

function run(any, message) {

    if (!t(message, Message)) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const channel = message.channel;
    const author = message.author;
    const id = author.id;
    const createdTime = message.createdTimestamp;
    const handle = error => MessageUtilities.handleError(error, message);
    let embed = MessageUtilities.errorRichEmbed(author);

    const previousTime = cooldownMap.get(id);
    if (previousTime !== undefined && (createdTime - previousTime) / 1000 < Time.COOLDOWN) {
        const waitTime = Time.COOLDOWN / 60;
        return channel.send(embed.setTitle("Cooldown")
            .setDescription(`You have to wait ${Number.isInteger(waitTime) ? waitTime : `around ${Math.ceil(waitTime)}`
                } minutes between cutting down trees.`)).catch(handle);
    }

    Database.retrieve(id).then(user => {

        const axe = user.inventory.getBestAxe();
        if (!axe) {
            return channel.send(embed.setTitle("Tools are required")
                .setDescription("You need an axe to cut. Perhaps get a free Stick from the shop?"));
        }

        embed = MessageUtilities.richEmbed(author);
        return channel.send(embed.setTitle("Searching for a tree").setThumbnail(MessageUtilities.getEmojiUrl("\ud83d\udd0d"))
            .setDescription("Searching for the nearest tree to cut down...")).then(() =>
                setTimeout(() => {
                    const generatedCode = random.randomHash(5);

                    channel.send(embed.setTitle("Found a tree").setThumbnail(MessageUtilities.getEmojiUrl("\ud83c\udf32"))
                        .setImage(`https://raw.githubusercontent.com/vanishedvan/lumberjack/assets/assets/${axe.toString().replace(/(^\[object\s)|(\]$)/g, "")}AndWoodLog.png`)
                        .setDescription(`I found a tree! To cut the tree down, please enter this code: ${code(generatedCode)}. You have ${Time.COLLECTOR} seconds.`))
                    .then(sent => {

                        embed = MessageUtilities.errorRichEmbed(author);
                        channel.awaitMessages(toCollect => toCollect.author.id === id, {
                            max: 1,
                            time: Time.COLLECTOR * 1000,
                            errors: ["time"]
                        }).then(collected => {

                            const firstCollected = collected.first();
                            if (firstCollected.content !== generatedCode) {
                                return channel.send(embed.setTitle("Incorrect code")
                                    .setDescription("You entered the wrong code. Please try using the command again.")).catch(handle);
                            }

                            const numberOfLogs = user.cut(axe,
                                ...((firstCollected.createdTimestamp - sent.createdTimestamp) / 1000 > Time.COLLECTOR - Time.REDUCED_REWARD ?
                                [1, 2] : [3, 5]));
                            Database.update(user).then(() => {

                                embed = MessageUtilities.richEmbed(author);
                                if (numberOfLogs) {
                                    cooldownMap.set(id, createdTime);
                                    const woodLogDetails = sGetItemDetails(WoodLog);

                                    embed.setTitle("You cut down a tree")
                                    .setThumbnail(MessageUtilities.getEmojiUrl(woodLogDetails.emote))
                                    .setDescription(`You have cut the tree down! You got ${numberOfLogs} ${woodLogDetails.friendlyName}s!`);

                                } else {
                                    embed.setTitle("BAM!").setThumbnail(MessageUtilities.getEmojiUrl("\ud83d\udca5"))
                                    .setDescription("The tree fell on you, you lost all items and money... Better luck next time!");
                                }
                                return channel.send(embed);

                            }).catch(handle);

                        }, () => channel.send(embed.setTitle("Time's up")
                            .setDescription("You ran out of time, so the woodskeeper kicked you out of the woods. Please try using the command again."))
                        .catch(handle));
                    }, handle);
                }, 1000 * (3 + random.randomNumber(4))));

    }).catch(handle);
}

module.exports = {
    run,
    help: new Help("cut",
        "This is a really special command, use this glorious command to actually cut down trees and get 'em fancy and heavy wood logs. 5-minute cooldown.")
};
