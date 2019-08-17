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

const {t} = require("../Type.js");
const Discord = require("discord.js");

function hasMentionFor(message, user) {

    if (!(t(message, Discord.Message) && (t(user, Discord.User) || t(user, Discord.GuildMember)))) {
        throw new TypeError("Incorrect type(s) for hasMentionFor arguments!");
    }

    const content = message.content;
    const matched = content.match(new RegExp(`<@\\!?${user.id}>`, "gi"));
    if (!matched) {
        return false;
    }

    const backSlashMatched = content.match(new RegExp(`\\\\*<@\\!?${user.id}>`, "gi"));
    let hasMatch = false;

    for (let i = 0; i < matched.length; i++) {
        if (!((backSlashMatched[i].length - matched[i].length) % 2)) {
            hasMatch = true;
            break;
        }
    }
    return hasMatch;
}

module.exports = {
    hasMentionFor
};
