const { wkm } = require('./commands/wkm');
const { Data } = require("../data/data")
const { Rcon } = require("../rcon/rcon")
const { MAPS } = require("../constants/constants")



async function pub_chat_handler(rcon_url, discord_message) {
    console.log("PUB_CHAT_HANDLER")
    const [steam_id, chat_message] = get_parts(discord_message)
    const data = new Data();
    const steam_name = await data.get_steam_name_by_id(steam_id)
    const rcon = new Rcon();


    if (chat_message.toLowerCase() === "!wkm") {
        wkm(rcon_url, steam_id, steam_name)
    }

    if (chat_message.toLowerCase() === "!leaders" || chat_message.toLowerCase() === "!leader") {
        const message = await rcon.get_top_game_killers(rcon_url) 
        rcon.message_player(rcon_url, steam_id, message, steam_name)
    }

    if (chat_message.toLowerCase() === "!victims" || chat_message.toLowerCase() === "!victim") {
        const message = await rcon.get_victim(rcon_url, steam_id) 
        rcon.message_player(rcon_url, steam_id, message, steam_name)
    }

    if (chat_message.toLowerCase() === "!weapons" || chat_message.toLowerCase() === "!weapon") {
        const message = await rcon.get_weapons(rcon_url, steam_id) 
        rcon.message_player(rcon_url, steam_id, message, steam_name)
    }

}

async function event_chat_handler(rcon_url, discord_message) {
    console.log("EVENT_CHAT_HANDLER")
    const [steam_id, chat_message] = get_parts(discord_message)
    const data = new Data();
    const rcon = new Rcon();
    const steam_name = await data.get_steam_name_by_id(steam_id)

    if (chat_message.toLowerCase() === "!cam") {
        const enabled = await data.get_command_mode()
        if (enabled) {
            console.log("Give admin cam")
            rcon.give_admin_cam(rcon_url, steam_id, steam_name)
            rcon.message_player(rcon_url, steam_id, "Admin cam added", steam_name)
            discord_message.reply(`Gave ${steam_name} (${steam_id}) admin cam`)
        } else {
            rcon.message_player(rcon_url, steam_id, "Command mode is diabled message an admin to enable commands", steam_name)
            discord_message.reply("Command mode disabled")
        }
        
    } else if (chat_message.toLowerCase().startsWith("!map")) {
        const enabled = await data.get_command_mode()
        if (!enabled) {
            rcon.message_player(rcon_url, steam_id, "Command mode is diabled message an admin to enable commands", steam_name)
            discord_message.reply("Command mode disabled")
            return
        }
        const limit = 10
        const [allies, axis, start_time] = await rcon.get_player_counts_by_side(rcon_url)
        const auth_users = await data.get_authorized_users()
        if ((allies + axis) > limit && !(await auth_users).includes(steam_id) ) {
            rcon.message_player(rcon_url, steam_id, `When greater than ${limit} players in server, command restricted to authorized users only`, steam_name)
            discord_message.reply(`Rejected currently ${limit} players`)
            return
        }

        console.log(`User ${steam_name}(${steam_id}) used !map`)
        const message_parts = chat_message.toLowerCase().split(" ")
        if (message_parts.length >= 2 && Object.keys(MAPS).includes(message_parts[1].trim())) {
            const map_name = MAPS[message_parts[1].trim()]
            rcon.change_map(rcon_url, map_name)
            rcon.message_player(rcon_url, steam_id, `Flipping map to ${map_name}`, steam_name)
            discord_message.reply(`Flipping map to ${map_name}`)
            console.log(`Flipping map to ${map_name}`)

        } else {
            let maps = ""
            for (let map of Object.keys(MAPS)) {
                maps += map + ", "
            }

            rcon.message_player(rcon_url, steam_id, "Invalid map key. Available map keys are:\n" + maps, steam_name)
            discord_message.reply(`Invalid map key`)
            console.log("Invalid map key")
        }
    } else if (chat_message.toLowerCase() === "!removecam") {
        const auth_users = await data.get_authorized_users()
        if (!(await auth_users).includes(steam_id) ) {
            rcon.message_player(rcon_url, steam_id, `Command restricted to autorized users`, steam_name)
            discord_message.reply(`Rejected`)
            return
        }

        const admins = await rcon.get_admin_cams(rcon_url)

        if (admins) {
            for (const admin of admins) {
                rcon.remove_cam(rcon_url, admin.steam_id_64)
            }

            rcon.message_player(rcon_url, steam_id, "Cams removed, but double check with rcon", steam_name)
            discord_message.reply("Cams removed")
        } else {
            rcon.message_player(rcon_url, steam_id, "Unable to retrieve admins", steam_name)
            discord_message.reply("Unable to retrieve admins")
        }
    } else if (chat_message.toLowerCase() === "!toggle") {
        const auth_users = await data.get_authorized_users()
        if (!(await auth_users).includes(steam_id) ) {
            rcon.message_player(rcon_url, steam_id, `Command restricted to autorized users`, steam_name)
            discord_message.reply(`Rejected`)
            return
        }
        const enabled = await data.get_command_mode()
        data.set_command_mode(!enabled)
        rcon.message_player(rcon_url, steam_id, `Command mode set to ${!enabled}`)
    }
}

function get_parts(message) {
    const steam_id_parts = message.embeds[0].data.author.url.split("/")
    const steam_id = steam_id_parts[steam_id_parts.length - 1]
    const chat_message = message.embeds[0].data.description

    return [steam_id, chat_message]
}

module.exports = { pub_chat_handler, event_chat_handler };
