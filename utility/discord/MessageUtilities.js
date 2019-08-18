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

const ErrorRichEmbed = require("../../discord/ErrorRichEmbed.js");
const MarkdownUtilities = require("../MarkdownUtilities.js");
const MultiRichEmbed = require("../../discord/MultiRichEmbed.js");
const {GENERIC_ERROR_TITLE} = require("../../Constants.js");
const {
    t,
    unwrap
} = require("../Type.js");
const Discord = require("discord.js");

function richEmbed(discordUser, data) {

    if (!(discordUser == null || t(discordUser, Discord.User))) {
        throw new TypeError("Incorrect type for richEmbed argument!");
    }

    const embed = t(data, Discord.RichEmbed) ? data : new Discord.RichEmbed(data);
    embed.setColor("#ff0000");

    if (discordUser) {
        embed.setFooter(`To: ${discordUser.username}`, discordUser.avatarURL);
    }
    return embed;
}

function errorRichEmbed(discordUser, data) {

    if (!t(discordUser, Discord.User)) {
        throw new TypeError("Incorrect type for errorRichEmbed argument!");
    }

    return richEmbed(discordUser, new ErrorRichEmbed(data));
}

function multiRichEmbed(discordUser, data) {

    if (!(discordUser == null || t(discordUser, Discord.User))) {
        throw new TypeError("Incorrect type for multiRichEmbed argument!");
    }

    return richEmbed(discordUser, new MultiRichEmbed(data));
}

function ensureEmbedNotEmpty(embed, string) {

    string = unwrap(string);
    if (!(t(embed, Discord.RichEmbed) && t(string, "string"))) {
        throw new TypeError("Incorrect type(s) for ensureEmbedNotEmpty arguments!");
    }

    if (!embed.fields.length) {
        embed.addField(`No ${string}`, "Oh look. It's empty.");
    }
    return embed;
}

function getEmojiUrl(string) {

    string = unwrap(string);
    if (!t(string, "string")) {
        throw new TypeError("Incorrect type for getEmojiUrl argument!");
    }

    if (!string.length) {
        throw new RangeError("string must not be empty!");
    }

    if (/^\<a?\:.+\:\d+\>$/gi.test(string)) {
        return `https://cdn.discordapp.com/emojis/${string.replace(/(^\<a?\:.+\:)|(\>$)/g, "")}.${
            /^\<a/gi.test(string) ? "gif" : "png"}`;
    }

    let codePointString = "";
    let i = 0;
    while (true) {

        const decimal = string.codePointAt(i);
        if (decimal === undefined) {
            break;
        }
        i += (decimal > 0xffff ? 2 : 1);
        codePointString += `-${decimal.toString(16)}`;
    }
    return `https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/${codePointString.substring(1)}.png`;
}

function handleError(error, message) {

    if (!(error == null || (message == null || (t(message, Discord.Message) &&
            (t(message.channel, Discord.DMChannel) || t(message.channel, Discord.TextChannel)))))) {
        throw new TypeError("Incorrect type(s) for handleError arguments!");
    }

    console.error(error);

    if (message && message.client.readyAt) {

        let url = "https://github.com/vanishedvan/lumberjack/issues/new";
        if (t(error, Error)) {
            url += `?title=${encodeURIComponent(error.message.replace(/\n/g, " "))}&body=${encodeURIComponent(error)}`;
        }

        message.channel.send(richEmbed().setTitle(GENERIC_ERROR_TITLE).setDescription(MarkdownUtilities.code(error))
            .addField("Frequently encountering this issue?", `Please report by ${
                MarkdownUtilities.link("creating an issue here", url)}.`))
        .catch(console.error);
    }
}

module.exports = {
    richEmbed,
    errorRichEmbed,
    multiRichEmbed,
    ensureEmbedNotEmpty,
    getEmojiUrl,
    handleError
};
