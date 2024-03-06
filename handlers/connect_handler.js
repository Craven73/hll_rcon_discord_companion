const { Rcon } = require("../rcon/rcon")
const { LEVEL_KICK_THRESHOLD, LEVEL_CAP, SEEDING_THRESHOLD, IDLE_KICK_ON, IDLE_KICK_OFF, LEVEL_AUTO_MOD } = require("../constants/constants")

async function connect_handler(rcon_url, log, message) {
    console.log("CONNECT_HANDLER");
    const rcon = new Rcon();
    const steam_id = get_connect_steam_id(log);
    const vips = await rcon.get_vips(rcon_url)
    const players = await rcon.get_players(rcon_url)
    const [allies, axis, game_start_time] = await rcon.get_player_counts_by_side(rcon_url)
    const [level, name] = await rcon.get_player_level(rcon_url, steam_id)

    if (players.length >= IDLE_KICK_ON) {
        console.log("Setting idle kick to 10")
        rcon.set_idle_kick(rcon_url, 10)
    } else if (players.length <= IDLE_KICK_OFF) {
        console.log("Setting idle kick to 0")
        rcon.set_idle_kick(rcon_url, 0)
    }

    if (players.length >= 85) {
        let result = await rcon.get_level_auto_mod(rcon_url)
        if (!result) {
            console.log("enable level automod")
            let level_auto_mod_changes = JSON.parse(JSON.stringify(LEVEL_AUTO_MOD))
            level_auto_mod_changes.enabled = true
            rcon.set_level_auto_mod(rcon_url, level_auto_mod_changes)
        }
    }

    // if (allies < SEEDING_THRESHOLD || axis < SEEDING_THRESHOLD) {
    //     console.log("message player seeding")
    //     rcon.message_player(rcon_url, steam_id, "Seeding Rules are in effect until 30v30.\n\n1. Only fight over the midpoint.\n 2. No tanks, artillery, bombing runs, strafing runs, or precision strikes.\n\nAutomatic VIP applied for seeding.", name)
    //     message.reply(`Informed ${name} (${steam_id}) of seeding and rules`)
    //     return
    // }


    // if (!Object.keys(vips).includes(steam_id)) {
    //     if (players.length >= LEVEL_KICK_THRESHOLD) {
    //         if (level < LEVEL_CAP) {
    //             console.log("Kick " + steam_id)
    //             rcon.kick_player(rcon_url, steam_id, name, "Limiting the number of players in the server under level 25")
    //             message.reply(`Kicked **__${name} (${steam_id})__** for being level **__${level}__**`)
    //         }
    //     }
    // }

    // Level VIP Mistake
    // if (level >= 100 && allies >= SEEDING_THRESHOLD && axis >= SEEDING_THRESHOLD) {
    //     let vips_steam_ids = Object.keys(vips)

    //     const currentDate = new Date();
    //     const oneWeekInMilliseconds = 2 * 24 * 60 * 60 * 1000; // 2 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    //     const currentDatePlusOneWeek = new Date(currentDate.getTime() + oneWeekInMilliseconds);

    //     if (vips_steam_ids.indexOf(steam_id) > -1) {
    //         const current_expiration = vips[steam_id].vip_expiration
    //         const current_vip = new Date(current_expiration)

    //         if (currentDatePlusOneWeek > current_vip) {
    //             console.log("Update VIP")
    //             rcon.give_vip(rcon_url, steam_id, name + "-level-vip", currentDatePlusOneWeek)
    //             rcon.message_player(rcon_url, steam_id, "Glad to have you back!\n\nYour VIP has been extended for 2 days from now for being over level 100\n\nContinue to skip the queue when you join back to the server.", name)
    //             message.reply(`Extended VIP to **${name} (${steam_id})** for being over level 100`)
    //             return 
    //         } 
    //     } else {
    //         console.log("Give VIP")
    //         rcon.give_vip(rcon_url, steam_id, name + "-level-vip", currentDatePlusOneWeek)
    //         rcon.message_player(rcon_url, steam_id, "Welcome to the Syndicate Server!\n\nYou have been given VIP for 2 days from now for being over level 100\n\nSkip the queue when you join back to the server.", name)
    //         message.reply(`Gave VIP to **${name} (${steam_id})** for being over level 100`)
    //         return 
    //     }
    // }


    // Free Weekend
    // const [level, name] = await rcon.get_player_level(rcon_url, steam_id)
    // if (level >= 100 && !Object.keys(vips).includes(steam_id)) { 
    //     console.log("free weekend vip")
    //     const vip_message = "You have been given VIP until the end of free weekend for being over level 100"
    //     let specificDate = new Date(Date.UTC(2023, 11, 5, 0, 0, 0)); // December 8, 2023, 18:38:09 GMT
    //     let formattedDate = formatUTCDate(specificDate);
    //     rcon.give_vip(rcon_url, steam_id, name, formattedDate)
    //     rcon.message_player(rcon_url, steam_id, vip_message, name)
    //     message.reply(`${name} (${steam_id}) level ${level} has been given VIP until the end of free weekend `)
    // }
}

function formatUTCDate(date) {
    let year = date.getUTCFullYear();
    let month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, add 1
    let day = date.getUTCDate().toString().padStart(2, '0');
    let hours = date.getUTCHours().toString().padStart(2, '0');
    let minutes = date.getUTCMinutes().toString().padStart(2, '0');
    let seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}+00:00`;
}

function get_connect_steam_id(log) {
    let parts = log.split(" ");
    let steam_id = parts[parts.length - 1];
    steam_id = steam_id.substring(1, steam_id.length - 1)

    return steam_id;
}

module.exports = { connect_handler };