const sqlite3 = require('sqlite3');
const random = require('random-value-generator');

const db = new sqlite3.Database('./structures/jack.db').on("error", console.error);

const cooldown = new Map();
const cdseconds = 300;
const codeInputTime = 7;

module.exports.run = async (client, msg) => {
  if ((msg.createdTimestamp - cooldown.get(msg.author.id)) / 1000 < cdseconds) {
    return msg.reply(`You have to wait ${cdseconds / 60} minutes between chopping down trees.`);
  } else {

    const idAsNumber = Number(msg.author.id);
    db.all("SELECT money, inventory FROM wood WHERE id=?", idAsNumber, (err, rows) => {

      if (!rows.length) {
        rows[0] = {
          id: idAsNumber,
          money: 15,
          inventory: "{}"
        };
        db.run("INSERT INTO wood(id, inventory) VALUES(?, ?)", idAsNumber, rows[0].inventory);
      }

      const obj = JSON.parse(rows[0].inventory);
      msg.channel.send("Searching for the nearest tree to cut down...");

      const code = random.randomHash(5);

      const logs = 1 + random.randomInteger(5);

      setTimeout(() => {
        msg.channel.send(`I found a tree! To cut the tree down, please enter this code: \`${code}\`. You have ${codeInputTime} seconds.`)
          .then(newmsg => //Now newmsg is the message you sent
            newmsg.channel.awaitMessages(response => response.content, {
              max: 1,
              time: codeInputTime * 1000,
              errors: ['time'],
            }).then(collected => {
              if (collected.first().content === code) {
                cooldown.set(msg.author.id, msg.createdTimestamp);
                newmsg.channel.send(`You have cut the tree down! You got ${logs} wood logs!`);

                obj.wood += logs;

                db.run("INSERT INTO wood(id, inventory) VALUES(?, ?)", idAsNumber, JSON.stringify(obj));

              } else {
                newmsg.channel.send("You entered the wrong code. Please try using the command again.");
              }
            }).catch(() =>
              newmsg.channel.send("You ran out of time, so the woodskeeper kicked you out of the woods. Please try using the command again.")));
      }, 5000);
    });
  }
};

module.exports.help = {
  name: "chop" 
};
