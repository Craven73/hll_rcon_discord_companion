const { Rcon } = require("../rcon/rcon")
const { Data } = require("../data/data")
const { Webhook } = require("../discord/webhook")

const { MATCH_END_THRESHOLD } = require("../constants/constants")

const part1 = "Welcome to the Syndicate Server!\n\nTop 10 Killers Last 7 Days (Kills):\n"
const part2 = `\n\n------Seeding Rules------
1. Seeding rules are in effect until 30v30
2. Only fight over the middle point
3. No tanks, arty, strafing runs, bombing runs, or precision strikes

------Rules:------
1. No racism, no homophobia, no Nazi glorification. Don't be an asshole.
2. Squad leaders must at least communicate through text chat. Commander must have mic. Keep comms brief and see Rule 1.
3. No intentional TKing, for any reason. Do not retaliate. Use !admin to report TKs.
4. No solo locking armor or recon squads
5. Hacking, cheating, griefing, trolling, sharing info with other team will result in a ban.
6. Streamers must use overlay to cover map.
7. Supply trucks are for CO, SLs, and Engineers only. Priority goes to building garrisons. Do not take them if you are another class.
8. Admins may kick/ban for any reason.`


const INF_MAX_KILLS = 50
const INF_MIN_KILLS = 40
const INF_COMBAT_MIN = 500
const SL_KILLS_COMBO_THRESHOLD = 30
const SL_SUPPORT_COMBO_THRESHOLD = 800
const SL_SUPPORT_ONLY = 1500
const ARMOR_COMBAT_MIN = 1000
const ARMOR_KILL_MIN = 30
const COMMANDER_MIN_SUPPORT = 4000

async function match_end_handler(rcon_url) {
    console.log("MATCH_END_HANDLER")
    const data = new Data()
    const webhook = new Webhook()
    const rcon = new Rcon();

    const [allies, axis, start_time] = await rcon.get_player_counts_by_side(rcon_url)

    const killers = await data.get_top_killers();
    let killer_text = ""
    if (killers.length >= 10){
        for (let ndx = 0; ndx < 10; ndx++) {
            killer_text += `${killers[ndx].steam_name} (${killers[ndx].kills})`

            if (ndx < 9) {
                killer_text += ", "
            }
        }
        const welcome_message = part1 + killer_text + part2
        rcon.set_welcome_message(rcon_url, welcome_message)
    }
    webhook.update_killer(killers)
    
    if ((allies + axis) >= MATCH_END_THRESHOLD) {
        // Award VIP
        const [axis, allies] = await rcon.get_performance(rcon_url)
        const vips = await rcon.get_vips(rcon_url)
        const axis_reward = await handle_vip(rcon_url, axis, vips, rcon)
        const allies_reward = await handle_vip(rcon_url, allies, vips, rcon)
        webhook.performance_reward("Axis Performance Reward", axis_reward)
        webhook.performance_reward("Allies Performance Reward", allies_reward)
        
        let axis_award_id = []
        let axis_names = ""
        for (let player of axis_reward) {
            axis_award_id.push(player.steam_id)
            axis_names += player.name + "\n"
        } 

        let allies_award_id = []
        let allies_names = ""
        for (let player of allies_reward) {
            allies_award_id.push(player.steam_id)
            allies_names += player.name + "\n"
        }

        message = "Players Receiving VIP for Performance\n\nAxis:\n" + axis_names + "\nAllies:\n" + allies_names

        for (let player of axis) {
            if (!axis_award_id.includes(player.steam_id)) {
                rcon.message_player(rcon_url, player.steam_id, message, player.name)
            }
        }

        for (let player of allies) {
            if (!allies_award_id.includes(player.steam_id)) {
                rcon.message_player(rcon_url, player.steam_id, message, player.name)
            }
        }

    }
}

async function handle_vip(rcon_url, side, vips, rcon) {
    console.log("handling vips")
    const currentDate = new Date();
    const TwoDaysInMilliseconds = 2 * 24 * 60 * 60 * 1000; // 2 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    const currentDatePlusTwoDays = new Date(currentDate.getTime() + TwoDaysInMilliseconds);
    let side_reward = []

    let vips_steam_ids = Object.keys(vips)
    for (let player of side) {
        
        let current_vip = null
        if (vips_steam_ids.indexOf(player.steam_id) > -1) {
            const current_expiration = vips[player.steam_id].vip_expiration
            current_vip = new Date(current_expiration)
            if (currentDatePlusTwoDays < current_vip) { 
                continue
            }
        }

        
        if (player.kills >= INF_MIN_KILLS && (player.type == "infantry" || player.type == "recon")) {
            if (current_vip === null) {
                console.log("performance give vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYou have been given VIP for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            } else {
                console.log("update vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYour VIP has been extended for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            }
            side_reward.push(player)
        } else if (player.kills >= INF_COMBAT_MIN && (player.type == "infantry" || player.type == "recon")) {
            if (current_vip === null) {
                console.log("performance give vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYou have been given VIP for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            } else {
                console.log("update vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYour VIP has been extended for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            }
            side_reward.push(player)
        } else if (player.kills >= SL_KILLS_COMBO_THRESHOLD && player.support >= SL_SUPPORT_COMBO_THRESHOLD && (player.role == "officer" || player.role == "spotter")) {
            if (current_vip === null) {
                console.log("performance give vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYou have been given VIP for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            } else {
                console.log("update vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYour VIP has been extended for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            }
            side_reward.push(player)
        } else if (player.support >= SL_SUPPORT_ONLY && (player.role == "officer" || player.role == "spotter")) {
            if (current_vip === null) {
                console.log("performance give vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYou have been given VIP for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            } else {
                console.log("update vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYour VIP has been extended for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            }
            side_reward.push(player)
        } else if (player.kills >= ARMOR_KILL_MIN && player.combat >= ARMOR_COMBAT_MIN && player.type == "armor") {
            if (current_vip === null) {
                console.log("performance give vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYou have been given VIP for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            } else {
                console.log("update vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYour VIP has been extended for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            }
            side_reward.push(player)
        } else if (player.support >= COMMANDER_MIN_SUPPORT  && player.type == "commander") {
            if (current_vip === null) {
                console.log("performance give vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYou have been given VIP for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            } else {
                console.log("update vip")
                rcon.give_vip(rcon_url, player.steam_id, player.name + "-performance-vip", currentDatePlusTwoDays)
                rcon.message_player(rcon_url, player.steam_id, "PERFORMANCE REWARD!\n\nYour VIP has been extended for the next 48 hours as a result of your performance this game \n\nSkip the queue when you join back to the server.", player.name)
                // webhook.performance_reward(player, currentDatePlusTwoDays)
            }
            side_reward.push(player)
        }
    }
    console.log("done")
    return side_reward
}

module.exports = { match_end_handler };