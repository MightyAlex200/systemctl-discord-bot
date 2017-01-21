const Cleverbot = require('cleverbot-node');
const Discord = require('discord.js');
const client = new Discord.Client();
const https = require('https');
fs = require('fs');

cleverbot = new Cleverbot;
Cleverbot.prepare(() => { })

class Bot {

    constructor() {
        this.aspamlist = {
            systemctl: 1
        };
        this.server = null;
        this.channel = null;
    }

    parse(message) {
        var parsed = message.content.toLowerCase().split(" ");
        if (message.channel.type != "dm") {
            if (message.member.hasPermission("ADMINISTRATOR")) {
                if (message.content.startsWith("freeze all motor functions") || message.content.replace("'",'').startsWith("thats enough")) {
                    // message.reply("done.");
                    message.channel.overwritePermissions(message.mentions.users.first(), {
                        SEND_MESSAGES: false
                    });
                }
                if (message.content.startsWith("continue")) {
                    // message.reply("done.");
                    message.channel.overwritePermissions(message.mentions.users.first(), {
                        SEND_MESSAGES: true
                    });
                }
            }
        }
        if (message.channel.type == "dm") {
            var isadmin = message.author.id == "140561788688269312" || message.author.id == "74549416190545920"
            // if (message.author.id == "140561788688269312" || message.author.id == "74549416190545920") {
            // This is a dm command

            switch (parsed[0]) {
                case "servers":
                    if (isadmin)
                        message.reply(client.guilds.array().toString().replace(",", ", "));
                    break;

                case "server":
                    if (isadmin) {
                        if (this.server) {
                            message.reply(this.server.name);
                        } else {
                            message.reply("Not in server");
                        }
                    }
                    break;

                case "channels":
                    if (isadmin) {
                        if (this.server) {
                            message.reply(this.server.channels.array().toString().replace(/,/g, ", "));
                        } else {
                            message.reply("Not in server");
                        }
                    }
                    break;

                case "channel":
                    if (isadmin) {
                        if (this.channel) {
                            message.reply(this.channel.name + " in " + this.server.name);
                        } else {
                            message.reply("Not in channel");
                        }
                    }
                    break;

                case "joinserver":
                    if (isadmin) {
                        var jointext = message.content.slice(11);
                        var tojoin = client.guilds.findAll('name', jointext)[0];
                        if (tojoin) {
                            message.reply("Joined server " + jointext);
                            this.server = tojoin;
                        } else {
                            message.reply("Server not found: " + jointext)
                        }
                    }
                    break;

                case "joinchannel":
                    if (isadmin) {
                        if (this.server) {
                            var jointext = message.content.slice(12).replace("#", "");
                            var tojoin = this.server.channels.findAll('name', jointext)[0];
                            if (tojoin) {
                                message.reply("Joined channel " + jointext);
                                this.channel = tojoin;
                            } else {
                                message.reply("Channel not found: " + jointext)
                            }
                        }
                    }
                    break;
                case "say":
                    if (isadmin) {
                        if (this.channel) {
                            var saytext = message.content.slice(4);
                            if (this.channel.type == "text") {
                                this.channel.sendMessage(saytext);
                            } else {
                                message.reply(this.channel.type + " channel");
                            }
                        }
                    }
                    break;
                default:
                    if (message.content.toLowerCase().startsWith("delete this interaction")) {
                        var nlimit = parseInt(message.content.slice(24)) || 2
                        nlimit = Math.min(nlimit, 100)
                        message.channel.fetchMessages({ limit: nlimit }).then((c) => {
                            var myMessages = c.filter(
                                (m) => {
                                    return m.author.id == 265572496223371265
                                }
                            ).array()
                            for (var index in myMessages) {
                                myMessages[index].delete()
                            }
                        })
                    } else {
                        if ((message.author.id != 265572496223371265) && !message.content.toLowerCase().startsWith("systemctl")) {
                            cleverbot.write(message.content, (r) => {
                                message.reply(r.message);
                            })
                        }
                    }
                    break;
            }

        }
        if (parsed[0] == "systemctl") {
            // This is a command
            switch (parsed[1]) {
                case "say":
                    message.channel.sendMessage(message.content.replace("systemctl say ", ""));
                    if (message.deletable)
                        message.delete();
                    break;
                case "avatar":
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
                    break;
                case "e621":
                case "e926":
                    if (!isNaN(parseInt(parsed[2]))) {
                        var e926 = "";
                        if (parsed[1] == "e926") {
                            e926 = "+rating:s"
                        }
                        var options = {
                            hostname: "e621.net",
                            path: "/post/index.json?tags=" + message.content.slice(16 + parsed[2].length).replace(/ /g, "+") + e926 + "&limit=1&page=" + parsed[2],
                            port: 443,
                            headers: {
                                'user-agent': 'systemctl-bot/1.1.0'
                            }
                        };
                        console.log(options.path);
                        https.get(options, (res) => {
                            var str = '';
                            res.on('data', (d) => {
                                str += d;
                            });
                            res.on('end', () => {
                                //console.log(JSON.parse(str)[parseInt(parsed[2])]);
                                var parsedjson = JSON.parse(str);
                                if (str != "[]") {
                                    ///message.channel.sendFile(JSON.parse(str)[0].file_url);
                                    var embed = new Discord.RichEmbed({
                                        title: "Result:",
                                        url: parsedjson[0].file_url
                                    });
                                    if (parsedjson[0].file_ext == "swf" || parsedjson[0].file_ext == "webm") {
                                        embed.setImage(parsedjson[0].preview_url);
                                    } else {
                                        embed.setImage(parsedjson[0].file_url);
                                    }
                                    switch (parsedjson[0].rating) {
                                        case 's':
                                            embed.setColor([0, 255, 0]);
                                            break;
                                        case 'q':
                                            embed.setColor([255, 255, 0]);
                                            break;
                                        case 'e':
                                            embed.setColor([255, 0, 0]);
                                            break;
                                    }
                                    embed.setFooter("score: " + parsedjson[0].score);
                                    message.channel.sendEmbed(embed);
                                    if (parsedjson[0].rating == 'e') {
                                        message.channel.sendMessage("( ͡° ͜ʖ ͡°)");
                                    }
                                    console.log(parsedjson[0].preview_url);
                                } else {
                                    message.reply("404, file not found");
                                }
                            })
                        });
                    } else {
                        if (parsed[2] == "count") {
                            var e926 = "";
                            if (parsed[1] == "e926") {
                                e926 = "+rating:s"
                            }
                            var options = {
                                hostname: "e621.net",
                                path: "/post/index.json?limit=320&tags=" + message.content.slice(16 + parsed[2].length).replace(/ /g, "+") + e926,
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
                                    var parsedjson = JSON.parse(str);
                                    if (parsedjson.length != 320)
                                        message.reply(parsedjson.length);
                                    else
                                        message.reply("320+");
                                })
                            });
                        } else {
                            if (parsed[2] == "link") {
                                var e926 = "";
                                if (parsed[1] == "e926") {
                                    e926 = "+rating:s"
                                }
                                var options = {
                                    hostname: "e621.net",
                                    path: "/post/index.json?limit=1&page=" + parsed[3] + "&tags=" + message.content.slice(16 + parsed[2].length + parsed[3].length).replace(/ /g, "+") + e926,
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
                                        var parsedjson = JSON.parse(str);
                                        message.reply("https://www.e621.net/post/show?id=" + parsedjson[0].id)
                                    })
                                });
                            } else {
                                message.reply("parsed[2] was incorrect (3rd word seperated by spaces should be number)!");
                            }
                        }
                    }

                    break;
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

var passwd;

fs.readFile('passwords.log', 'utf8', (e, f) => {
    if (!e) {
        passwd = f;
        client.login(passwd);
    } else {
        console.log(e);
    }
});


setInterval(() => {
    for (var spamval in b.aspamlist) {
        b.aspamlist[spamval] = Math.max(b.aspamlist[spamval] - 1, 0);
    }
}, 2500);

setInterval(() => {
    fs.readFile('lastposted.log', 'utf8', (e, d) => {
        var last = d;
        var options = {
            hostname: "e621.net",
            path: "/post/index.json?limit=1&tags=favoritedby:furrylocked",
            port: 443,
            headers: {
                'user-agent': 'systemctl-bot/1.1.0'
            }
        }
        https.get(options, (res) => {
            var str = '';
            res.on('data', (d) => {
                str += d;
            });
            res.on('end', () => {
                var parsedjson = JSON.parse(str);
                // console.log(parsedjson[0].id);
                if (last != parsedjson[0].id.toString()) {
                    // console.log('new post! ' + last + ' to ' + parsedjson[0].id.toString());
                    client.guilds.findAll('name', 'arch')[0].channels.findAll('name', 'no-dont-touch-that')[0].sendMessage('Nitro faved something on e621 ( ͡° ͜ʖ ͡°).');
                    client.guilds.findAll('name', 'arch')[0].channels.findAll('name', 'no-dont-touch-that')[0].sendMessage('systemctl e621 1 favoritedby:furrylocked');
                    // console.log('got something from nitro: ' + last + ' to ' + parsedjson[0].id.toString());
                }
                fs.writeFile('lastposted.log', parsedjson[0].id.toString(), (err) => {
                    if (err) console.log('error saving lastposted.log file! ' + err);
                });
            });
        });
    });
    fs.readFile('lastposted-hitius.log', 'utf8', (e, d) => {
        var last = d;
        var options = {
            hostname: "e621.net",
            path: "/post/index.json?limit=1&tags=favoritedby:hitius",
            port: 443,
            headers: {
                'user-agent': 'systemctl-bot/1.1.0'
            }
        }
        https.get(options, (res) => {
            var str = '';
            res.on('data', (d) => {
                str += d;
            });
            res.on('end', () => {
                var parsedjson = JSON.parse(str);
                // console.log(parsedjson[0].id);
                if (last != parsedjson[0].id.toString()) {
                    // console.log('new post! ' + last + ' to ' + parsedjson[0].id.toString());
                    var e926 = 'e621';
                    if (parsedjson[0].rating == 's') {
                        e926 = 'e926';
                    }
                    client.guilds.findAll('name', 'arch')[0].channels.findAll('name', 'no-dont-touch-that')[0].sendMessage('hitius faved something on ' + e926);
                    client.guilds.findAll('name', 'arch')[0].channels.findAll('name', 'no-dont-touch-that')[0].sendMessage('systemctl e621 1 favoritedby:hitius');
                    // console.log('got something from hitius: ' + last + ' to ' + parsedjson[0].id.toString());
                }
                fs.writeFile('lastposted-hitius.log', parsedjson[0].id.toString(), (err) => {
                    if (err) console.log('error saving lastposted-hitius.log file! ' + err);
                });
            });
        });
    });
}, 30000);
