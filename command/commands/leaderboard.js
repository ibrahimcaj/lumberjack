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

const User = require("../../game/User.js");
const {sGetItemDetails} = require("../../game/item/Item.js");
const {WoodLog} = require("../../game/item/CommonItems.js");
const {retrieve} = require("../../Database.js");
const {Emotes} = require("../../Constants.js");
const Discord = require("discord.js");
const MessageUtilities = require("../../utility/discord/MessageUtilities.js");
const {
    t,
    isFunction,
    unwrap
} = require("../../utility/Type.js");
const Help = require("../Help.js");
const Syntax = require("../Syntax.js");

const DisplayedUsers = {
    DEFAULT: 10,
    MAX: 100
};

function run(client, message, args) {

    if (!(t(client, Discord.Client) && t(message, Discord.Message) && Array.isArray(args))) {
        throw new TypeError("Incorrect type(s) for run arguments!");
    }

    args = args.map(unwrap);
    if (!args.every(arg => t(arg, "string"))) {
        throw new TypeError("Incorrect type for run arguments!");
    }

    const handle = error => MessageUtilities.handleError(error, message);
    const channel = message.channel;
    retrieve().then(async users => {

        const argsLength = args.length;
        const balance = "balance";
        const leaderboardType = argsLength ? args[0].toLowerCase() : undefined;
        const isWoodLeaderboard = leaderboardType === "wood";
        let embed = MessageUtilities.errorRichEmbed(message.author);
        let amount = DisplayedUsers.DEFAULT;

        if (argsLength) {
            const potentialAmount = Number(args[
                (isWoodLeaderboard || leaderboardType === balance) && argsLength > 1 ? 1 : 0]);
            if (!Number.isNaN(potentialAmount)) {

                if (!(Number.isInteger(potentialAmount) && potentialAmount > 0)) {
                    embed.setTitle("Invalid amount").setDescription("The amount you wish to see on leaderboard is invalid!");

                } else if (potentialAmount > DisplayedUsers.MAX) {
                    embed.setTitle("Reached maximum limit").setDescription(`The maximum number of users to display is ${DisplayedUsers.MAX}`);

                } else {
                    amount = potentialAmount;
                }
            }
        }

        if (embed.title !== undefined) {
            return channel.send(embed).catch(handle);
        }

        if (isWoodLeaderboard) {

            const details = sGetItemDetails(WoodLog);
            const friendlyName = details.friendlyName;
            embed = await getEmbed(client, users, `number of ${friendlyName}s in inventory`,
                details.emote, amount, `${friendlyName}s`, user => user.inventory.count(WoodLog));

        } else {
            embed = await getEmbed(client, users, balance, Emotes.BILL, amount, "coins", user => user.money);
        }

        MessageUtilities.ensureEmbedNotEmpty(embed, "users").send(channel)
        .then(results => results.filter(result => t(result, Error)).forEach(handle));
    }).catch(handle);
}

async function getEmbed(client, users, sortByString, emote, amount, unit, getQuantityFunction) {

    sortByString = unwrap(sortByString);
    emote = unwrap(emote);
    amount = unwrap(amount);
    unit = unwrap(unit);
    if (!(t(client, Discord.Client) &&
        Array.isArray(users) && users.every(user => t(user, User) || t(user, Error)) &&
        t(sortByString, "string") &&
        t(emote, "string") &&
        t(amount, "number") &&
        t(unit, "string") &&
        isFunction(getQuantityFunction))) {
        throw new TypeError("Incorrect type(s) for getEmbed arguments!");
    }

    if (!(Number.isInteger(amount) && amount > 0 && amount <= DisplayedUsers.MAX)) {
        throw new RangeError(`amount must be a positive integer not greater than ${DisplayedUsers.MAX}!`);
    }

    const embed = MessageUtilities.multiRichEmbed().setTitle("Leaderboard")
        .setDescription(`Top ${amount} users, sorted by ${sortByString}:`)
        .setThumbnail(MessageUtilities.getEmojiUrl(emote));

    users = users.filter(user => t(user, User) && getQuantityFunction(user) > 0)
        .sort((first, second) => getQuantityFunction(second) - getQuantityFunction(first));

    let lastUserQuantity = 0;
    let unlistedEntries = 0;
    for (const user of users) {
        await client.fetchUser(user.id).then(discordUser => {

            const embedFieldsLength = embed.fields.length;
            const tag = discordUser.tag;
            const quantity = getQuantityFunction(user);

            if (embedFieldsLength === amount) {
                if (quantity < lastUserQuantity) {
                    return;
                }
                unlistedEntries++;

            } else {
                lastUserQuantity = quantity;
                embed.addField(embedFieldsLength ? tag : `${Emotes.FIRST} ${tag}`, `${quantity} ${unit}`);
            }
        }).catch(console.error);
    }

    if (unlistedEntries) {
        embed.setFooter(`...and ${unlistedEntries} more users with the same ${sortByString} as #${amount}.`);
    }

    return embed;
}

module.exports = {
    run,
    help: new Help("leaderboard", `Global leaderboard for user balance, top ${DisplayedUsers.DEFAULT} users are displayed by default, maximum number of entries is ${DisplayedUsers.MAX}.`)
        .setSyntax(new Syntax().optional("balance").optional("entries"))
        .addSubCommands(new Help("wood", `Global leaderboard for the number of Woods in inventory, top ${DisplayedUsers.DEFAULT} users are displayed by default, maximum number of entries is ${DisplayedUsers.MAX}.`)
            .setSyntax(new Syntax().optional("entries")))
};
