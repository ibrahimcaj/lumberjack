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
const {remove} = require("../../Database.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const {code} = require("../../utility/MarkdownUtilities.js");
const {Emotes} = require("../../Constants.js");
const {
    t,
    unwrap
} = require("../../utility/Type.js");
const Help = require("../Help.js");

const PREFIX = require("../../config.json").prefix;

function run(client, message, args) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const channel = message.channel;
    const author = message.author;
    const confirm = "confirm";
    const handle = error => MessageUtilities.handleError(error, message);

    if (!args.length || args[0].toLowerCase() !== confirm) {
        return channel.send(MessageUtilities.richEmbed(author).setTitle("Confirm deletion")
            .setThumbnail(MessageUtilities.getEmojiUrl(Emotes.EXCLAMATION))
            .setDescription(`Do ${code(`${PREFIX}delete ${confirm}`)} to confirm deletion.`)).catch(handle);
    }

    remove(author.id).then(() => channel.send(MessageUtilities.richEmbed(author)
        .setTitle("Deleted").setThumbnail(MessageUtilities.getEmojiUrl(Emotes.TICK))
        .setDescription("Your game data has been deleted permanently.")))

    .then(() => author.createDM().then(async dmChannel => {
        while (true) {

            let fetcheds;
            try {
                fetcheds = await dmChannel.fetchMessages({limit: 100});
            } catch (error) {
                return MessageUtilities.handleError(error);
            }

            fetcheds = fetcheds.filter(fetched => fetched.author.id === client.user.id);
            if (!fetcheds.size) {
                return;
            }
            for (const fetched of fetcheds.values()) {
                await fetched.delete().catch(MessageUtilities.handleError);
            }
        }
    }).catch(MessageUtilities.handleError)).catch(handle);
}

module.exports = {
    run,
    help: new Help("delete", "DANGEROUS! Delete your game data permanently.")
};
