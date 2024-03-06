const { Data } = require("../data/data")
const { Rcon } = require("../rcon/rcon")
const { Webhook } = require('../discord/webhook');
const { SEEDING_THRESHOLD, SEEDING_AUTO_MOD, LEVEL_AUTO_MOD } = require("../constants/constants")

async function teamswitch_handler(rcon_url) {
    console.log("TEAMSWITCH_HANDLER")
    const data = new Data();
    const rcon = new Rcon();
    data.hello()
    const was_seeded = await data.is_seeded()
    console.log(was_seeded)
    const [allies, axis, game_start_time] = await rcon.get_player_counts_by_side(rcon_url)
    // console.log(allies)
    // console.log(axis)

    if (was_seeded && allies <= SEEDING_THRESHOLD - 10 && axis <= SEEDING_THRESHOLD - 10 && allies > 0 && axis > 0) {
        console.log("Server No Longer Seeded");
        data.set_not_seeded();

        let seeding_auto_mod_changes = JSON.parse(JSON.stringify(SEEDING_AUTO_MOD))
        seeding_auto_mod_changes.enabled = true
        rcon.set_seeding_auto_mod(rcon_url, seeding_auto_mod_changes)

        let level_auto_mod_changes = JSON.parse(JSON.stringify(LEVEL_AUTO_MOD))
        level_auto_mod_changes.enabled = false
        rcon.set_level_auto_mod(rcon_url, level_auto_mod_changes)
    }

    if (was_seeded) {
        return
    }

    if (allies >= SEEDING_THRESHOLD && axis >= SEEDING_THRESHOLD) {
        console.log("Server Seeded")
        data.set_seeded()
        let players = await rcon.get_players(rcon_url)
        data.record_seeders(players, game_start_time)
        console.log("seed recorded")
        console.log(game_start_time)
        // players = [{ name: 'syn | Craven', steam_id: '76561198206503409', seed_time: 159 }]

        let vips = await rcon.get_vips(rcon_url)
        let vips_steam_ids = Object.keys(vips)

        // console.log(vips_steam_ids)

        for (const player of players) {
            let steam_id = player.steam_id
            // console.log(player)
            if (vips_steam_ids.indexOf(player.steam_id) > -1 ){
                console.log("vip")
                const current_expiration = vips[player.steam_id].vip_expiration
                const currentDate = new Date();
                const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
                const currentDatePlusOneDay = new Date(currentDate.getTime() + oneDayInMilliseconds);

                const current_vip = new Date(current_expiration)
                if (currentDatePlusOneDay > current_vip) {
                    console.log("Update VIP")
                    rcon.give_vip(rcon_url, steam_id, player.name + "-seed-vip", currentDatePlusOneDay)
                    rcon.message_player(rcon_url, player.steam_id, "Your VIP has been extended to expire 24hrs from now. Skip the queue when you join back.\n\nThe server has reached 30v30 and is now seeded. Thank you for seeding our server.", player.name)
                } else {
                    console.log("don't change vip")
                    rcon.message_player(rcon_url, player.steam_id, "The server has reached 30v30 and is now seeded. Thank you for seeding our server. No change has been made to your existing VIP", player.name)
                }

            } else {
                console.log("give VIP")
                const currentDate = new Date();
                const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
                const currentDatePlusOneDay = new Date(currentDate.getTime() + oneDayInMilliseconds);
                rcon.give_vip(rcon_url, steam_id, player.name + "-seed-vip", currentDatePlusOneDay)          
                rcon.message_player(rcon_url, player.steam_id, "You have been given VIP to the server for 24hrs. Skip the queue when you join back.\n\n The server has reached 30v30 and is now seeded. Thank you for seeding our server.", player.name)
            }
            
        }

        let seeding_auto_mod_changes = JSON.parse(JSON.stringify(SEEDING_AUTO_MOD))
        seeding_auto_mod_changes.enabled = false
        rcon.set_seeding_auto_mod(rcon_url, seeding_auto_mod_changes)

        const [two_week_seed_leader, three_months, all_time] = await data.get_seeding_leaders()
        let webhook = new Webhook()
        webhook.update_seeders(two_week_seed_leader, three_months, all_time)
    }
}

async function turn_on_level_automod(rcon_url, rcon) {
    let count = 0
    while (count < 10) {
        console.log("Waiting on player count ", count)
        const players = await rcon.get_players(rcon_url)
        if (players.length > 80) {
            let level_auto_mod_changes = JSON.parse(JSON.stringify(LEVEL_AUTO_MOD))
            level_auto_mod_changes.enabled = true
            rcon.set_level_auto_mod(rcon_url, level_auto_mod_changes)
            return
        }
        count++
        await sleep(120000);
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = { teamswitch_handler };