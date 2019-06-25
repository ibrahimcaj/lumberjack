const Discord = require("discord.js");

module.exports.run = async (client, msg, args) => {
  if (msg.author.id !== "267025484028706816") return;
  
  function clean(text) {
  	if (typeof(text) === "string")
  	return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
		else
  	return text;
  }
  
  if(msg.author.id !== "267025484028706816") return;

  try {
  	const code = args.join(" ");
	  let evaled = eval(code);
  	if (typeof evaled !== "string")
  		evaled = require("util").inspect(evaled);
  		msg.channel.send(clean(evaled), {code:"xl"});
  	} catch (err) {
  		msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
  	}
  }

module.exports.help = {
  name: "eval",  
}