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
const {Emotes} = require("./Constants.js");
const {bold} = require("./utility/MarkdownUtilities.js");
const {Client} = require("discord.js");
const Help = require("./command/Help.js");
const {t} = require("./utility/Type.js");

function getHelpEmbed(helpOrClient) {

    if (!(t(helpOrClient, Help) || t(helpOrClient, Client))) {
        throw new TypeError("Incorrect type for getHelpEmbed argument!");
    }

    const setThumbnail = embed => embed.setThumbnail(MessageUtilities.getEmojiUrl(Emotes.QUESTION));

    if (t(helpOrClient, Help)) {
        const description = helpOrClient.description;
        const content = helpOrClient.content;
        const embed = setThumbnail(MessageUtilities.richEmbed().setTitle(helpOrClient.name).setDescription(content));
        if (content != description) {
            embed.setFooter(description);
        }
        return embed;
    }

    const zeroWidthSpace = "\u200b";
    const embed = MessageUtilities.multiRichEmbed().setTitle("Help")
    .setDescription(`Heya there! I am Jack, the Lumberjack. I am a Discord bot made by a lovely team for the 2019 Discord Hack Week! My job here is to allow you to become a real ${bold("lumberjack")}! Well, at least on Discord.\n\nCommands:`);

    Array.from(helpOrClient.commands.values()).map(commandExports => commandExports.help.toString()).filter(string => string !== "")
    .forEach(string => embed.addField(zeroWidthSpace, string));

    return setThumbnail(embed);
}

module.exports = {
    getHelpEmbed
};
