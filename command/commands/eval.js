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

const MarkdownUtilities = require("../../utility/MarkdownUtilities.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const Discord = require("discord.js");
const {
    t,
    unwrap
} = require("../../utility/Type.js");
const vm = require("vm");
const {resolve} = require("path");
const {inspect} = require("util");
const {isOwner} = require("../../Config.js");
const Help = require("../Help.js");

function run(client, message, args) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const handle = error => MessageUtilities.handleError(error, message);
    const content = message.content;
    const channel = message.channel;
    const author = message.author;

    if (!isOwner(author)) {
        return channel.send(MessageUtilities.errorRichEmbed(author).setTitle("You're not the bot owner")
            .setDescription("You need to be the bot owner to use this command!")).catch(handle);
    }

    let result;
    let promise;
    const toCodeBlock = stringResolvable => MarkdownUtilities.codeBlock(stringResolvable, "xl");
    const toErrorBlock = error => `Error:\n${toCodeBlock(error)}`;

    try {

        const context = vm.createContext({
            client: client,
            message: message,
            args: args,
            require: moduleId => require(moduleId.includes("./") ? resolve(resolve(), moduleId) : moduleId)
        });
        const PromiseInContext = vm.runInContext("this;", context).Promise;

        const wrap = "`".repeat(3);
        result = vm.runInContext(args.length ?
                content.substring(content.indexOf(args[0])).replace(new RegExp(`(^\\s*${wrap})|(${wrap}\\s*$)`, "g"), "") : "",
            context, {timeout: 10000});

        if (t(result, Promise) || t(result, PromiseInContext)) {
            promise = result.then(value => toCodeBlock(t(value, "string") ? value : inspect(value))).catch(toErrorBlock);
        }
        if (!t(result, "string")) {
            result = inspect(result);
        }
        result = toCodeBlock(result);

    } catch (error) {
        result = toErrorBlock(error);
    }

    channel.send(result).catch(handle).finally(() => {
        if (promise) {
            return promise.then(value => channel.send(value));
        }
    }).catch(handle);
}

module.exports = {
    run,
    help: new Help("eval", "Evaluates JavaScript code represented as a string.", false)
        .setContent(`Use ${MarkdownUtilities.code("client")} to access the client:${
            MarkdownUtilities.codeBlock("client.user.tag // -> Lumberjack#1296", "js")
        }Use ${MarkdownUtilities.code("require")} to require modules from relative to project root directory:${
            MarkdownUtilities.codeBlock("require(\"./Database.js\").retrieve // -> [Function: retrieve]", "js")
        }`)
};
