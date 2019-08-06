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

const {sGetItemDetails} = require("../../game/item/Item.js");
const Database = require("../../Database.js");
const Discord = require("discord.js");
const ItemUtilities = require("../../utility/ItemUtilities.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const {code} = require("../../utility/MarkdownUtilities.js");
const {
    t,
    unwrap
} = require("../../utility/Type.js");
const Help = require("../Help.js");
const Syntax = require("../Syntax.js");

const PREFIX = require("../../config.json").prefix;

function run(client, message, args) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    if (!args.length) {
        return displayShop(client, message);
    }

    const newArgs = args.slice(1);
    switch (args[0].toLowerCase()) {

        case "buy": {
            processPurchase(message, newArgs);
            break;
        }

        case "sell": {
            processSell(message, newArgs);
            break;
        }

        case "item": {
            displayItem(message, newArgs);
            break;
        }

        default: {
            const itemData = ItemUtilities.findItem(args);
            itemData ? sendItemEmbed(message, itemData) : displayShop(client, message);
        }
    }
}

function displayShop(client, message) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message))) {
        throw new TypeError("Incorrect type(s) for displayShop arguments!");
    }

    const shop = "shop";
    const shopPrefixed = `${PREFIX}${shop}`;
    const getSubCommandSyntax = name => {
        const subCommand = client.commands.get(shop).help.subCommands
            .filter(subCommand => subCommand.name === name)[0];
        return `${subCommand.name}${subCommand.syntax}`;
    };

    const multiEmbed = MessageUtilities.multiRichEmbed().setTitle("Shop")
        .setThumbnail(MessageUtilities.getEmojiUrl("\ud83d\uded2"))
        .setDescription(`Use ${code(`${shopPrefixed} ${getSubCommandSyntax("buy")}`)} to buy an item from the shop,${" "
            }or use ${code(`${shopPrefixed} ${getSubCommandSyntax("sell")}`)} to sell an item.${" | "
            }You can also use ${code(`${shopPrefixed} ${getSubCommandSyntax("item")}`)} to look at item info.`)
        .setFooter("Resale value of tools (axes) depends on the remaining durability. The resale value of a brand new axe is approximately 50% of its original price.");

    Object.values(ItemUtilities.getAllTypes()).forEach(Type => {

        const itemData = sGetItemDetails(Type);
        let fieldContent = `Description: ${itemData.description}\nPrice: ${itemData.price}`;

        const durabilityData = itemData.durability;
        if (durabilityData) {
            fieldContent += `\nDurability: ${durabilityData.value1}`;
            const value2 = durabilityData.value2;
            if (value2 !== undefined) {
                fieldContent += ` ~ ${value2}`;
            }
        }

        multiEmbed.addField(`${itemData.emote} ${itemData.friendlyName}`, fieldContent);
    });

    multiEmbed.send(message.channel).then(results => results.filter(result => t(result, Error))
        .forEach(error => MessageUtilities.handleError(error, message)));
}

function displayItem(message, args) {

    if (!(t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const embed = MessageUtilities.errorRichEmbed(message.author);
    const itemData = ItemUtilities.findItem(args);

    if (!args.length) {
        embed.setTitle("Need more arguments").setDescription("Please specify an item!");
    } else if (!itemData) {
        embed.setTitle("Unknown item").setDescription("The item does not exist!");
    }

    if (embed.title !== undefined) {
        return message.channel.send(embed).catch(error => MessageUtilities.handleError(error, message));
    }

    sendItemEmbed(message, itemData);
}

function sendItemEmbed(message, itemData) {

    if (!(t(message, Discord.Message) && t(itemData, "object"))) {
        throw new TypeError("Incorrect type(s) for displayItem arguments!");
    }

    const embed = MessageUtilities.richEmbed().setTitle(itemData.friendlyName)
        .setThumbnail(MessageUtilities.getEmojiUrl(itemData.emote))
        .addField("Description", itemData.description)
        .addField("Price", itemData.price);

    const durabilityData = itemData.durability;
    if (durabilityData) {
        const value2 = durabilityData.value2;
        embed.addField("Durability", `${durabilityData.value1}${value2 === undefined ? "" : ` ~ ${value2}`}`);
    }

    message.channel.send(embed).catch(error => MessageUtilities.handleError(error, message));
}

function processPurchase(message, args) {

    if (!(t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const handle = error => MessageUtilities.handleError(error, message);
    const channel = message.channel;
    const author = message.author;
    const itemData = ItemUtilities.findItem(args);
    const errorEmbed = MessageUtilities.errorRichEmbed(author);
    let friendlyName;
    let amount;

    if (!args.length) {
        errorEmbed.setTitle("Need more arguments").setDescription("Please specify what you want to purchase!");

    } else if (!itemData) {
        errorEmbed.setTitle("Unknown item").setDescription("Mate, that item does not exist.");

    } else {
        friendlyName = itemData.friendlyName;
        const friendlyNameSplitLength = friendlyName.split(/\s+/g).length;
        amount = args.length > friendlyNameSplitLength ? Number(args[friendlyNameSplitLength]) : 1;

        if (!(Number.isInteger(amount) && amount > 0)) {
            errorEmbed.setTitle("Invalid amount").setDescription("The amount you wish to purchase is invalid!");
        }
    }

    if (errorEmbed.title !== undefined) {
        return channel.send(errorEmbed).catch(handle);
    }

    let purchased;
    Database.retrieve(author.id).then(user => {

        purchased = user.buy(ItemUtilities.getAllTypes()[itemData.name], amount);
        return Database.update(user);

    }).then(() => channel.send(purchased < 0 ?

        errorEmbed.setTitle("Not enough money")
        .setDescription("Don't try to scam me mate. You don't have enough money.") :
        MessageUtilities.richEmbed(author).setTitle("Successful purchase")
        .setThumbnail(MessageUtilities.getEmojiUrl(itemData.emote))
        .setDescription(`You successfully purchased ${amount} ${friendlyName}s for ${purchased} coins!`))).catch(handle);
}

function processSell(message, args) {

    if (!(t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const handle = error => MessageUtilities.handleError(error, message);
    const channel = message.channel;
    const author = message.author;
    const itemData = ItemUtilities.findItem(args);
    const errorEmbed = MessageUtilities.errorRichEmbed(author);
    let friendlyName;
    let amount;

    if (!args.length) {
        errorEmbed.setTitle("Need more arguments").setDescription("Please specify what you want to sell!");

    } else if (!itemData) {
        errorEmbed.setTitle("Unknown item").setDescription("Mate, that item does not exist.");

    } else {
        friendlyName = itemData.friendlyName;
        const friendlyNameSplitLength = friendlyName.split(/\s+/g).length;
        amount = args.length > friendlyNameSplitLength ? Number(args[friendlyNameSplitLength]) : 1;

        if (!(Number.isInteger(amount) && amount > 0)) {
            errorEmbed.setTitle("Invalid amount").setDescription("The amount you wish to sell is invalid!");
        }
    }

    if (errorEmbed.title !== undefined) {
        return channel.send(errorEmbed).catch(handle);
    }

    let sold;
    Database.retrieve(author.id).then(user => {

        sold = user.sell(ItemUtilities.getAllTypes()[itemData.name], amount);
        return Database.update(user);

    }).then(() => channel.send(sold < 0 ?

        errorEmbed.setTitle(`Not enough ${friendlyName}s`)
        .setDescription(`Don't try to scam me mate. You don't have enough ${friendlyName}s.`) :
        MessageUtilities.richEmbed(author).setTitle("Successful sell")
        .setThumbnail(MessageUtilities.getEmojiUrl(itemData.emote))
        .setDescription(`You successfully sold ${amount} ${friendlyName}s for ${sold} coins!`))).catch(handle);
}

module.exports = {
    run,
    help: new Help("shop",
            "By using this command, you can get your hands on some of our most glorious axes and other cool items! You can also sell or get information on other items!")
        .addSubCommands(new Help("buy", "Buy items from the shop.").setSyntax(new Syntax().required("item").optional("amount")),
            new Help("sell", "Sell items in your inventory.").setSyntax(new Syntax().required("item").optional("amount")),
            new Help("item", "Get information about an item from the shop.").setSyntax(new Syntax().required("item")))
};
