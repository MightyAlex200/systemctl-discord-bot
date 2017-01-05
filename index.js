const Discord = require('discord.js');
const client = new Discord.Client();
const https = require('https');

class Bot {

    constructor() {
        this.aspamlist = {
            systemctl: 1
        };
        this.server = null;
        this.channel = null;
    }

    parse(message) {
        var parsed = message.content.split(" ");
        if (message.channel.type == "dm") {
            if (message.author.id == "140561788688269312" || message.author.id == "74549416190545920") {
                // This is a dm command
                if (message.content == "servers") {
                    message.reply(client.guilds.array().toString().replace(",", ", "));
                }
                if (message.content == "server") {
                    if (this.server) {
                        message.reply(this.server.name);
                    } else {
                        message.reply("Not in server");
                    }
                }
                if (message.content == "channels") {
                    if (this.server) {
                        message.reply(this.server.channels.array().toString().replace(",", ", "));
                    } else {
                        message.reply("Not in server");
                    }
                }
                if (message.content == "channel") {
                    if (this.channel) {
                        message.reply(this.channel.name + " in " + this.server.name);
                    } else {
                        message.reply("Not in channel");
                    }
                }
                if (parsed[0] == "joinserver") {
                    var jointext = message.content.slice(11);
                    var tojoin = client.guilds.findAll('name', jointext)[0];
                    if (tojoin) {
                        message.reply("Joined server " + jointext);
                        this.server = tojoin;
                    } else {
                        message.reply("Server not found: " + jointext)
                    }
                }
                if (parsed[0] == "joinchannel" && this.server) {
                    var jointext = message.content.slice(12);
                    var tojoin = this.server.channels.findAll('name', jointext)[0];
                    if (tojoin) {
                        message.reply("Joined channel " + jointext);
                        this.channel = tojoin;
                    } else {
                        message.reply("Channel not found: " + jointext)
                    }
                }
                if (parsed[0] == "say" && this.channel) {
                    var saytext = message.content.slice(4);
                    this.channel.sendMessage(saytext);
                }
            }
        }
        if (parsed[0] == "systemctl") {
            // This is a command
            if (parsed[1] == "say") {
                message.channel.sendMessage(message.content.replace("systemctl say ", ""));
                if (message.deletable)
                    message.delete();
            }
            if (parsed[1] == "avatar") {
                if (parsed[2]) {
                    if (message.guild) {
                        var users = message.guild.members.array();
                        var found = false;
                        for (var i in users) {
                            if (users[i].user.username.toLowerCase() == parsed[2].toLowerCase()) {
                                message.reply(users[i].user.avatarURL);
                                found = true;
                                break;
                            };
                        }
                        if (!found) {
                            message.reply("User not found: " + parsed[2]);
                        }
                    }
                } else {
                    if (message.author.avatarURL) {
                        message.reply(message.author.avatarURL);
                    }
                }
            }
            if (parsed[1] == "e621") {
                if (parsed[2] != "") {
                    var options = {
                        hostname: "e621.net",
                        path: "/post/index.json?tags=" + message.content.slice(16 + parsed[2].length).replace(/ /g, "+") + "&limit=1&page=" + parsed[2],
                        port: 443,
                        headers: {
                            'user-agent': 'systemctl-bot/1.1.0'
                        }
                    };
                    https.get(options, (res) => {
                        var str = '';
                        res.on('data', (d) => {
                            str += d;
                        });
                        res.on('end', () => {
                            //console.log(JSON.parse(str)[parseInt(parsed[2])]);
                            var parsedjson = JSON.parse(str);
                            if (parsedjson != []) {
                                ///message.channel.sendFile(JSON.parse(str)[0].file_url);
                                var embed = new Discord.RichEmbed({
                                    title: "Result:",
                                    url: parsedjson[0].file_url
                                });
                                embed.setImage(parsedjson[0].preview_url);
                                message.channel.sendEmbed(embed);
                                console.log(parsedjson[0].preview_url);
                            } else {
                                message.reply("404, file not found");
                            }
                        })
                    });
                } else {
                    message.reply("parsed[2] equaled null!");
                }

            }
        }
        this.aspamlist[message.author.username] = Math.min(this.aspamlist[message.author.username] + 1 || 1, 5);
        console.log(message.author.username + ": " + message.author.id + ": " + this.aspamlist[message.author.username] + ": " + message.content);
        if (this.aspamlist[message.author.username] >= 5) {
            console.log(this.aspamlist.systemctl);
            if (this.aspamlist.systemctl <= 1)
                message.reply('Slow down! You\'ve posted too many things at once.');
            if (message.deletable)
                message.delete();
        }
    }

}

var b = new Bot();

client.on('ready', () => {
    console.log('Bot online :)');
});

client.on('message', message => {
    b.parse(message);
});

client.login('MjY1NTcyNDk2MjIzMzcxMjY1.C0xFlg.nraNxYADdNfkWSCdgCHTCsAKLss');

setInterval(function () {
    for (var spamval in b.aspamlist) {
        b.aspamlist[spamval] = Math.max(b.aspamlist[spamval] - 1, 0);
    }
}, 2500);