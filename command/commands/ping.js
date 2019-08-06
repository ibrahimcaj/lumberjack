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

const {Message} = require("discord.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const {t} = require("../../utility/Type.js");
const Help = require("../Help.js");

function run(any, message) {

    if (!t(message, Message)) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    message.channel.send(MessageUtilities.richEmbed().setTitle("I am alive!")
        .setThumbnail(MessageUtilities.getEmojiUrl("\ud83c\udfd3")).setDescription(`${message.client.ping.toFixed()}ms`))
    .catch(error => MessageUtilities.handleError(error, message));
}

module.exports = {
    run,
    help: new Help("ping", "Displays the ping of Lumberjack bot.", false)
};
