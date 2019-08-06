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
const {
    t,
    unwrap
} = require("../../utility/Type.js");
const Help = require("../Help.js");
const Syntax = require("../Syntax.js");

function run(any, message, args) {

    if (!(t(message, Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    message.channel.send(MessageUtilities.errorRichEmbed(message.author).setTitle("Sorry")
        .setDescription("This feature isn't available yet :(.")).catch(error => MessageUtilities.handleError(error, message));
}

module.exports = {
    run,
    /* Set shouldDisplay to true once give command is finished */
    help: new Help("give", "Give money and items to other users.", false)
        .setSyntax(new Syntax().or(
            new Syntax().required("item").optional("amount").toString(true),
            new Syntax().plain("balance").required("amount").toString(true)))
};
