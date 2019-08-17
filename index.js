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

const Database = require("./Database.js");
const {respond} = require("./DirectMessage.js");
const {handleError} = require("./utility/discord/MessageUtilities.js");
const {
    t,
    unwrap
} = require("./utility/Type.js");
const {Activities} = require("./Constants.js");
const UserResolver = require("./utility/discord/UserResolver.js");

const Discord = require("discord.js");
const Events = Discord.Constants.Events;
const client = new Discord.Client({disableEveryone: true});
client.commands = new Map();

const fs = require("fs");
const {format} = require("url");
const path = require("path");

const credentialsConfig = require("./credentials-config.json");
const PREFIX = require("./config.json").prefix;
let activityI = 0;

process.on("uncaughtException", error => {
    console.error(error);
    exit(1);
}).on("unhandledRejection", console.error);

["SIGHUP", "SIGINT", "SIGTERM", "SIGBREAK"]
.forEach(signal => process.on(signal, () => exit()));

const COMMANDS_FOLDER_PATH = "./command/commands/";

const filePaths = readFilesInDirectorySync(COMMANDS_FOLDER_PATH)
    .filter(filePath => /\.m?js$/g.test(filePath));

if (!filePaths.length) {
    console.log("Couldn't find commands.");
} else {
    filePaths.forEach(filePath => {

        const command = require(filePath);
        if (command.nonCommand) {
            return;
        }
        console.log(`${path.relative(COMMANDS_FOLDER_PATH, filePath)} loaded!`);

        const helpName = command.help.name.toLowerCase();
        if (client.commands.get(helpName)) {
            client.commands.delete(helpName);
            throw new Error(`Duplicated commands ${helpName}`);
        }

        client.commands.set(helpName, {
            run: command.run,
            help: command.help,
            path: filePath
        });
    });
}

Database.fixData().then(results => {
    const errorsLength = results.filter(result => t(result, Error)).length;
    console.log(`Examined and fixed data in the database, ${results.length - errorsLength} successes and ${errorsLength} failures.`);
});

client.once(Events.READY, () => {

    console.log(`${client.user.username} is online on ${client.guilds.size} servers!`);

    const changeActivity = () => {
        const activity = nextActivity();
        client.user.setActivity(activity.text, activity.option)
        .catch(error => console.error(`An error occured while setting presence!\n\n${error.stack}`));
    };
    changeActivity();
    client.setInterval(changeActivity, 15000);

    client.guilds.filter(guild => guild.memberCount >= 5000).forEach(UserResolver.getInstance().addToBlacklist);

}).on(Events.MESSAGE_CREATE, async message => {

    const channelType = message.channel.type;
    const isDM = channelType === "dm";
    if (message.author.bot || !(channelType === "text" || isDM)) {
        return;
    }

    if (isDM) {
        return respond(client, message);
    }

    const content = message.content;
    if (!content.startsWith(PREFIX)) {
        return;
    }
    const messageArray = content.split(/\s+/gi);
    const args = messageArray.slice(1);

    const command = client.commands.get(messageArray[0].substring(PREFIX.length).toLowerCase());
    if (command) {

        const handle = error => handleError(error, message);
        try {
            const result = command.run(client, message, args);
            if (t(result, Promise)) {
                result.catch(handle);
            }
        } catch (error) {
            handle(error);
        }
    }

}).on(Events.ERROR, error => {

    process.env.WEBSOCKET_DIED = "true";
    console.error(error);
    exit(1);

}).login(credentialsConfig.token).catch(error => {
    console.error(`An error occured while logging in!\n\n${error.stack}`);
    exit();
});

function nextActivity() {

    const activities = Object.values(Activities);
    const length = activities.length;
    if (!length) {
        return {text: "Lumberjack"};
    }

    if (activityI === length) {
        activityI = 0;
    }
    return activities[activityI++];
}

function readFilesInDirectorySync(directoryPath) {

    directoryPath = unwrap(directoryPath);
    if (!(t(directoryPath, "string") || t(directoryPath, URL))) {
        throw new TypeError("Incorrect type for readFilesInDirectorySync argument!");
    }

    if (t(directoryPath, URL)) {
        directoryPath = format(directoryPath, {unicode: true});
    }

    const getPath = name => path.resolve(path.resolve(), directoryPath, `./${name}`);
    const isDirectory = name => {
        try {
            return fs.statSync(getPath(name)).isDirectory();
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    let names;
    try {
        names = fs.readdirSync(directoryPath);
    } catch (error) {
        console.log(error);
        return [];
    }

    const fileNames = names.filter(name => !isDirectory(name)).map(fileName => getPath(fileName));
    names.filter(name => isDirectory(name)).map(folderName => getPath(folderName))
    .forEach(folderPath => readFilesInDirectorySync(folderPath).forEach(fileName => fileNames.push(fileName)));

    return fileNames;
}

function exit(exitCode) {

    exitCode = unwrap(exitCode);
    if (!(t(exitCode, "number") || exitCode == null)) {
        throw new TypeError("Incorrect type for exit argument!");
    }

    if (exitCode != null && !Number.isInteger(exitCode)) {
        throw new RangeError("exitCode must be an integer!");
    }

    if (process.env.EXITING) {
        return console.log("exit is called but it was already called previously.");
    }

    process.env.EXITING = "true";
    if (exitCode == null) {
        exitCode = 0;
    }
    Database.closeDatabase().catch(console.error);

    if (!process.env.WEBSOCKET_DIED) {
        client.destroy().then(() => console.log("Client has logged out."));
        console.log("About to set process exit code, process will exit when no more tasks are pending.");
        process.exitCode = exitCode;
        return;
    }
    process.exit(exitCode);
}
