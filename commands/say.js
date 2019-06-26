const Discord = require("discord.js");

module.exports.run = async (client, msg, args) => {
  
  const embed = new Discord.RichEmbed()
      	.setColor('#ff0000')
        .setAuthor(msg.author.tag).addField(args.join(" "));
        msg.channel.send(embed);
}

module.exports.help = {
  name: "say" 
}
