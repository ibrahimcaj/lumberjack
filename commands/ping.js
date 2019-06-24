const Discord = require("discord.js");

module.exports.run = async (client, msg, args) => {
  msg.channel.send("I am alive!");
}

module.exports.help = {
  name: "ping" 
}
