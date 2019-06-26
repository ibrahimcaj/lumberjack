const Discord = require("discord.js");

module.exports.run = async (client, msg, args) => {
  if(!args || args.size < 1) return msg.reply("Must provide a command name to reload.");
  const commandName = args[0];

  if(!client.commands.has(commandName)) {
  	return msg.channel.send("```That command does not exist.```");
  }

  delete require.cache[require.resolve(`./${commandName}.js`)];

  client.commands.delete(commandName);
  const props = require(`./${commandName}.js`);
  	client.commands.set(commandName, props);
  	msg.channel.send("```\nThe command " + commandName + " has been reloaded.```");
  }

module.exports.help = {
  name: "reload" 
}