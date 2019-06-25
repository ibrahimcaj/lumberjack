const Discord = require("discord.js");
const sqlite3 = require('sqlite3');

const items = require('../items.json');

let db = new sqlite3.Database('./structures/jack.db');

module.exports.run = async (client, msg, args) => {
  
  db.all("SELECT money, inventory FROM wood WHERE id = '" + msg.author.id + "'", function (err, rows) {
    
    if (rows[0] === undefined) {
      db.run(`INSERT INTO wood(id, inventory) VALUES(?, ?)`, [msg.author.id, "{}"], function(err) {
        console.log("Inserted.");
      });
    }
    
    if (!args[0]) {
		var embed = new Discord.RichEmbed()
        .setAuthor("Shop")
        .setColor('#ff0000')
        .setFooter("Use !shop buy [item] to buy an item from the shop, or use !shop sell [item] to sell and item. | You can also use !shop [item] to look at item info.");
        
        var itemlist = Object.keys(items)
        
        for (i = 0; i < itemlist.length; i++) {
          var item = items[itemlist[i]]
          
          if (itemlist[i].includes("Axe")) {
          	embed.addField(item[2] + " " + item[0], "Description: " + item[1] + "\nPrice: " + item[3] + "\nDurability: " + item[4]);
          }
          
          embed.addField(item[2] + " " + item[0], "Description: " + item[1] + "\nPrice: " + item[3]);
        }
        
       msg.channel.send(embed);
    } else if (args[0] === "buy") {
		for (i = 0; i < itemlist.length; i++) {
			if (!args[1]) {
				return msg.channel.send("Please specify what you want to buy!");
			}
			
			if (!itemlist.contains(args[1])) { //this will not work
				return msg.channel.send("Mate, that item does not exist.");
			}
			
			if (rows[0].money >= item[3]) {
				var moneycalc = rows[0].money - item[3]
				
				db.run(`INSERT INTO wood(id, money) VALUES(?, ?)`, [msg.author.id, moneycalc], function(err) {
					console.log("Inserted.");
				});
				
				
			} else {
				return msg.channel.send("Don't try to scam me mate. You don't have enough money.");
			}
		}
    }
    
  });
}

module.exports.help = {
  name: "shop"
}

