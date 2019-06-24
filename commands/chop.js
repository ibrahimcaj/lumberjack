const Discord = require("discord.js");
const sqlite3 = require('sqlite3');
const random = require('random-value-generator');

const items = require('../items.json');

var item = Object.keys(items)[0]

let db = new sqlite3.Database('./structures/jack.db');

let cooldown = new Set();
let cdseconds = 300;

module.exports.run = async (client, msg, args) => {
  if (cooldown.has(msg.author.id)) {
    return msg.reply("You have to wait 5 minutes between chopping down trees.");
  } else {
    cooldown.add(msg.author.id);
    
    db.all("SELECT money, inventory FROM wood WHERE id = '" + msg.author.id + "'", function (err, rows) {
      
      if (rows[0] === undefined) {
        db.run(`INSERT INTO wood(id, inventory) VALUES(?, ?)`, [msg.author.id, "{}"], function(err) {
          console.log("Inserted.");
        });
      }
      
      var obj = JSON.parse(rows[0].inventory);
      
      var back = JSON.stringify(obj);
      
      /*if (!item[2] in obj || !item[3] in obj || !item[4] in obj || !item[5] in obj || !item[6] in obj) {
        msg.channel.send("You don't have an axe in your inventory.");
      } else {*/
        /*for (i = 6; i > 1; i--) {
          if (item[i] in obj) {*/
            msg.channel.send("Searching for the nearest tree to cut down...");
            
            const code = random.randomHash(5);
            
            const logs = random.randomInteger(5);
            
            function chopping(c) {
              msg.channel.send("I found a tree! To cut the tree down, please enter this code: `" + code + "`. You have 5 seconds.")
                .then((newmsg) => { //Now newmsg is the message you sent
                  newmsg.channel.awaitMessages(response => response.content, {
                    max: 1,
                    time: 9000,
                    errors: ['time'],
                  }).then((collected) => {
                    if (collected.first().content === code) {
                      newmsg.channel.send("You have cut the tree down! You got " + logs + " wood logs!");
                      
                      /*var obj = JSON.parse(rows.inventory);
                      
                      var back = JSON.stringify(obj);*/
                      
                      obj["wood"] = logs;
                      
                      db.run(`INSERT INTO wood(id, inventory) VALUES(?, ?)`, [msg.author.id, back], function(err) {
                      });
                      
                    } else {
                      newmsg.channel.send("You entered the wrong code. Please try using the command again.");
                    }
                  }).catch(() => {
                    newmsg.channel.send("You ran out of time, so the woodskeeper kicked you out of the woods. Please try using the command again.");
                  });
                });
            }
            //break;
          //}
        //} 
      //}
      
      setTimeout(chopping, 5000);
    });
  }
  
  setTimeout(() => {
    cooldown.delete(msg.author.id);
  }, cdseconds * 1000);
}

module.exports.help = {
  name: "chop" 
}