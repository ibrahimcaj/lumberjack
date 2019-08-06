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
const {Emotes} = require("../../Constants.js");
const {Message} = require("discord.js");
const Axe = require("../../game/item/axe/Axe.js");
const ItemUtilities = require("../../utility/ItemUtilities.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const {isDeveloper} = require("../../Config.js");
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

    const handle = error => MessageUtilities.handleError(error, message);
    const channel = message.channel;
    const author = message.author;
    const authorId = author.id;
    const numberOfArgs = args.length;
    const errorEmbed = MessageUtilities.errorRichEmbed(author);

    if (!isDeveloper(author)) {
        errorEmbed.setTitle("You're not a project developer")
        .setDescription("You need to be a developer of Lumberjack to use this command!");

    } else if (!args.length) {
        errorEmbed.setTitle("Need more arguments").setDescription("What do you want to add?");
    }

    if (errorEmbed.title !== undefined) {
        return channel.send(errorEmbed).catch(handle);
    }

    if (args[0].toLowerCase() === "balance") {

        if (numberOfArgs < 2) {
            return channel.send(errorEmbed.setTitle("Need more arguments")
                .setDescription("You need to provide an amount to add!")).catch(handle);
        }

        const money = Number(args[1]);
        if (!Number.isInteger(money)) {
            return channel.send(errorEmbed.setTitle("Invalid amount")
                .setDescription("The amount you wish to add is invalid!")).catch(handle);
        }

        return Database.retrieve(authorId).then(user => {
            user.money += money;
            return Database.update(user);
        }).then(() => channel.send(MessageUtilities.richEmbed(author).setTitle("Success")
            .setThumbnail(MessageUtilities.getEmojiUrl(Emotes.BILL))
            .setDescription(`${money} coins are added to your balance.`))).catch(handle);
    }

    const itemData = ItemUtilities.findItem(args);
    if (!itemData) {
        return channel.send(errorEmbed.setTitle("Unknown item").setDescription("The item does not exist!")).catch(handle);
    }

    const friendlyName = itemData.friendlyName;
    const friendlyNameSplitLength = friendlyName.split(/\s+/g).length;
    const amount = numberOfArgs > friendlyNameSplitLength ? Number(args[friendlyNameSplitLength]) : 1;

    if (!Number.isInteger(amount) || amount === 0) {
        return channel.send(errorEmbed.setTitle("Invalid amount")
            .setDescription("The amount you wish to add is invalid!")).catch(handle);
    }

    Database.retrieve(authorId).then(user => {

        const inventory = user.inventory;
        const Type = ItemUtilities.getAllTypes()[itemData.name];

        if (amount < 0 && inventory.count(Type) < -amount) {
            return channel.send(errorEmbed.setTitle(`Not enough ${friendlyName}s`)
                .setDescription(`Don't try to scam me mate. You don't have enough ${friendlyName}s.`));
        }

        let absolute = amount > 0 ? amount : -amount;
        if (amount > 0) {
            inventory.addByType(Type, amount);
        } else if (t(Type, Axe)) {
            while (absolute--) {
                inventory.delete(inventory.getBestAxe(Type));
            }
        } else {
            inventory.deleteByType(Type, absolute);
        }

        return Database.update(user).then(() => channel.send(MessageUtilities.richEmbed(author).setTitle("Success")
            .setThumbnail(MessageUtilities.getEmojiUrl(itemData.emote))
            .setDescription(`${amount} ${friendlyName}s are added to your inventory.`)));
    }).catch(handle);
}

module.exports = {
    run,
    help: new Help("add",
            "Developers of the project can use this command to add items or balance to themselves for the ease of testing.", false)
        .setSyntax(new Syntax().or(
            new Syntax().required("item").optional("amount").toString(true),
            new Syntax().plain("balance").required("amount").toString(true)))
};
