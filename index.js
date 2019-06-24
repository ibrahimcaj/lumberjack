const config = require("./config.json");
const Discord = require('discord.js');
const sqlite3 = require('sqlite3');
const random = require('random-value-generator');
const fs = require('fs');

const client = new Discord.Client({disableEveryone: true});
client.commands = new Discord.Collection();

let db = new sqlite3.Database('./structures/jack.db');

fs.readdir("./commands/", (err, files) => {
  if(err) console.log(err);
  
  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }
  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    
    client.commands.set(props.help.name, props);
  });
});

client.on("ready", async () => {
  console.log(`${client.user.username} is online on ${client.guilds.size} servers!`);
  client.user.setActivity("the trees.", {type: "WATCHING"}); //
});

client.on("message", async message => {
  if(message.author.bot) return;
  
  let prefix = config.prefix;
  if(!message.content.startsWith(prefix)) return;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  
  let commandfile = client.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(client,message,args);
});

client.on("message", async message => {
  if(message.author.bot) return;
  
  
});

client.login(config.token);

process.on("unhandledRejection", err => {
  console.error(`UnhandledRejection: \n${err.stack}`)
});

process.on("uncaughtException", err => {
  console.error(`UncaughtException: \n${err.stack}`)
});
