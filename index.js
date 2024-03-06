// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

require('dotenv').config();

const { pub_chat_handler, event_chat_handler } = require('./handlers/chat_handler');
const { teamswitch_handler } = require('./handlers/teamswitch_handler');
const { connect_handler } = require('./handlers/connect_handler');
const { match_end_handler } = require('./handlers/match_end_handler');
const { RCON_URL, EVENT_RCON_URL } = require('./constants/constants');
const { Webhook } = require("./discord/webhook")

const LOGIN = "/api/login"
const POST_PLAYER_COMMENT = "/api/post_player_comment"
const GET_VIPS = "/api/get_vip_ids"
// {
//   "steam_id_64": "76561199401522057",
//   "comment": "PlayerID 76561199401522057 blacklist for test"
// }
const BLACKLIST_PLAYER = "/api/blacklist_player"
// {
//     "steam_id_64": "76561199401522057",
//     "reason": "test"
//   }
// const RCON_URL = process.env.RCON_URL
const RCON_USERNAME = process.env.RCON_USERNAME
const RCON_PASSWORD = process.env.RCON_PASSWORD
const REASON = "You have been banned because you were reported to the bunker for cheating. If you think this was done by mistake or disagree with your cheating evidence please join https://discord.gg/syn-hll and ping a Game Server Admin"

async function setCookies() {
    try {
        const response = await axios.post(RCON_URL + LOGIN, {
            username: RCON_USERNAME,
            password: RCON_PASSWORD
        });

        // Take the set-cookie header
        return response.headers['set-cookie'];
    } catch (error) {
        console.error('Failed to set cookies:', error);
    }
}

async function addBlacklist(cookies, steam_id) {
    try {
        const response = await axios.post(RCON_URL + BLACKLIST_PLAYER, {
            reason: REASON,
            steam_id_64: steam_id
        }, {
            headers: {
                Cookie: cookies.join('; ')
            }
        });

        console.log('Blacklisted:', response.status);
    } catch (error) {
        console.error('Failed to add Blacklist:', error);
    }
}
async function addComment(cookies, steam_id, message_id) {
    try {
        const response = await axios.post(RCON_URL + POST_PLAYER_COMMENT, {
            comment: `Blacklisted for report bunker. Evidence: https://discord.com/channels/1117120667490455713/1123791562598535169/${message_id}`,
            steam_id_64: steam_id
        }, {
            headers: {
                Cookie: cookies.join('; ')
            }
        });

        console.log('Commented:', response.status);
    } catch (error) {
        console.error('Failed to add Comment:', error);
    }
}

async function getVIPs(cookies) {
    try {
        const response = await axios.get(RCON_URL + GET_VIPS, {
            headers: {
                Cookie: cookies.join('; ')
            }
        });
        // console.log(response)
        // console.log(response.data)

        const steam_ids = response.data.result.map(entry => entry.steam_id_64);
        // console.log(steam_ids)
        return steam_ids;

    } catch (error) {
        console.error('Failed to add Comment:', error);
    }
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // console.log(message.content)

    channel_id = message.channelId
    // if (channel_id !== "1123791562598535169") return;
    if (channel_id === "1123791562598535169" && message.author.id === "1123791852013887550") {
        // message = await message.channel.messages.fetch("1156760036194926674")
        const steamIdRegex = /7656119\d{10}/g;
        const matches = message.content.match(steamIdRegex);
        if (matches) {
            steam_id = matches[0]
            console.log("Found Steam IDs:", matches);
            let cookies = await setCookies()

            let vips = await getVIPs(cookies)
            if (vips.includes(steam_id)) {
                message.reply("<@&1118141770002354237> A VIP has been reported to the bunker. No action has been taken. Please look into this")
            } else {
                await addBlacklist(cookies, steam_id)
                await addComment(cookies, steam_id, message.id)
                message.reply(`🔨 Blacklisted: ${steam_id}`)
            }
            
        } else {
            console.log("No Steam IDs found.");
        }
    } else if (channel_id === "1178690923702538261" && message.author.id === "1178691019785646160") {
        // console.log("syn rcon")
        // console.log(message.content)
        // console.log(message.embeds)
        if (message.embeds.length == 1) {
            let log = message.embeds[0].data.description
            if (log.startsWith("ADMIN BANNED")) {
                console.log("Ban")
            } else if (log.startsWith("ADMIN KICKED")) {
                console.log("kick")
            } else if (log.startsWith("CHAT")) {
                // const steam_id_regex = /\((Axis|Allies)\/(\d{17})\)/;
                // let steam_id = log.match(steam_id_regex)
                // steam_id = steam_id ? steam_id[2] : null;
                // parts = log.split(steam_id + ")]:");
                // // message = parts[1].trim()
                // chat_handler(RCON_URL, steam_id, parts[1].trim())
            } else if (log.startsWith("CONNECTED")) {
                console.log("connect")
                connect_handler(RCON_URL, log, message)
            } else if (log.startsWith("MATCH START")) {
                console.log("start")
            } else if (log.startsWith("MATCH ENDED")) {
                match_end_handler(RCON_URL)
            } else if (log.startsWith("TEAMSWITCH")) {
                teamswitch_handler(RCON_URL)
            } else if (log.startsWith("TK AUTO BANNED")) {
                console.log("Ban")
            } else if (log.startsWith("TK AUTO KICKED")) {
                console.log("Ban")
            }
        }

    // Pub Chats
    } else if (channel_id === "1178690923702538261" && message.author.id === "1181965887851466824") {
        pub_chat_handler(RCON_URL, message)
    // Event Chats
    } else if (channel_id === "1178690923702538261" && message.author.id === "1181748190156951682") {
        event_chat_handler(EVENT_RCON_URL, message)

    // Audit Logs
    } else if (channel_id === "1118140880814092299" && message.author.id === "1118141486899404871") {
        if (!message.content.startsWith("[SYN][**hll_bot**]")) {
            if (message.content.includes("`do_message_player`:") || message.content.includes("`set_maprotation`:") || message.content.includes("`do_kick`:") ||
            message.content.includes("`do_punish`:") ) {
                const webhook = new Webhook()
                webhook.post_audit_log(message.content)
                console.log("handle message players")
            }
        } else if (message.content.startsWith("[SYN][**hll_bot**]")) {
            if (message.content.includes("set_auto_mod_seeding_config")) {
                const webhook = new Webhook()
                webhook.post_audit_log(message.content)
            }
        }
    }

});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);




// const { Data } = require('./data/data')

// // const { Data } = require('./data/data');
// const{ Rcon } = require('./rcon/rcon')
// // const { Webhook } = require('./discord/webhook');


// const {SEEDING_AUTO_MOD, LEVEL_AUTO_MOD} = require("./constants/constants");

// (async () => {
//     const rcon = new Rcon()
//     let result = await rcon.get_weapons(RCON_URL, "76561198402580225")
//     console.log(result)


//     // const data = new Data();
//     // const killers = await data.get_top_killers();
//     // console.log(killers)

//     // match_end_handler(RCON_URL)
//     // let enabled = await data.get_command_mode()
//     // console.log(enabled)
//     // await data.set_command_mode(!enabled)
//     // enabled = await data.get_command_mode()
//     // console.log(enabled)


//     // const webhook = new Webhook();
//     // const [two_week_seed_leader, three_months, all_time] = await data.get_seeding_leaders()
//     // console.log(all_time)
//     // let webhook = new Webhook()
//     // webhook.update_seeders(two_week_seed_leader, three_months, all_time)
    

// })();

