const axios = require('axios');
const { RCON_URL, GET_RECENT_LOGS, SEND_MESSAGE, GET_PUBLIC_INFO, GET_PLAYERS, GET_VIPS, ADD_VIPS, TEAM_VIEW, DO_KICK, DO_ADD_ADMIN, SET_MAP, GET_ADMINS, REMOVE_ADMIN, SET_WELCOME, SET_IDLE_KICK, SEEDING_AUTO_MOD_CONFIG, LEVEL_AUTO_MOD_CONFIG, GET_LEVEL_AUTO_MOD_CONFIG, GET_LIVE_GAME_STATS} = require('../constants/constants');

class Rcon {
    constructor() {
        this.API_KEY = process.env.API_KEY
    }

    async get_player_counts_by_side(rcon_url) {
        console.log("request")
        let response = null;
        try{ 
            response = await axios.get(rcon_url + GET_PUBLIC_INFO, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })  
        } catch (error) {
            console.log("Request failed") 
            return [0, 0, 0]
        }
        if (response?.status === 200) {
            console.log("in")
            let players = response?.data?.result?.players
            let allies = players.allied
            let axis = players.axis
            let start_time = response?.data?.result?.current_map.start
            return [allies, axis, start_time]
        } 
        return [0, 0, 0 ]
    }

    async get_players(rcon_url) {
        let response = null;
        try{ 
            response = await axios.get(rcon_url + GET_PLAYERS, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })  
        } catch (error) {
            console.log("Request failed") 
            return []
        }
        
        if (response?.status === 200 && Array.isArray(response?.data?.result)) {
            let parsed_players = []
            for (const player of response.data.result){
                let play_time = 0
                try {
                    play_time = player.profile.current_playtime_seconds
                } catch (err) {
                    console.log("unable to get playtime")
                    console.log(player)
                }
                let parsed_player = {
                    name: player.name,
                    steam_id: player.steam_id_64,
                    seed_time: play_time
                }
                parsed_players.push(parsed_player)
            }
            
            return parsed_players
        } else {
            return []
        }
    }

    async get_vips(rcon_url) {
        let response = null;
        try{ 
            response = await axios.get(rcon_url + GET_VIPS, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })  
        } catch (error) {
            console.log("Request failed") 
            return {}
        }
        
        if (response?.status === 200 && Array.isArray(response?.data?.result)) {
            let vips = {}
            for (const vip of response.data.result){
                vips[vip.steam_id_64] = {
                    name: vip.name,
                    vip_expiration: vip.vip_expiration
                }
                    
            }
            return vips
        } else {
            return {}
        }
    }

    async message_player(rcon_url, steam_id, message, message_player) {
        const postData = {
            comment: "",
            duration_hours: 2,
            message: message,
            player: message_player,
            reason: message,
            save_message: true,
            steam_id_64: steam_id
        };
        let response = await axios.post(rcon_url + SEND_MESSAGE, postData, {
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
            }
        })
        console.log(response.status)
    }

    async get_player_level(rcon_url, steam_id) {
        console.log("get_player_level")
        let response = null;
        try{ 
            response = await axios.get(rcon_url + TEAM_VIEW, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })  
        } catch (error) {
            return [-1, ""]
        }
        // console.log(response.data)
        if (response?.status === 200) {
            const result = response.data.result
            if ("axis" in result) { 
                if ("squads" in result.axis) {
                    console.log("checking axis")
                    let [level, name] = this.parse_side(result.axis, steam_id);

                    if (level > 0) {
                        return [level, name]
                    }
                }
            }
            if ("allies" in result) { 
                if ("squads" in result.allies) {
                    console.log("checking allies")
                    let [level, name] = this.parse_side(result.allies, steam_id);

                    if (level > 0) {
                        return [level, name]
                    }
                }
            } 
            if ("none" in result) { 
                if ("squads" in result.none) {
                    console.log("checking none")
                    let [level, name] = this.parse_side(result.none, steam_id);

                    if (level > 0) {
                        return [level, name]
                    }
                }
            }
        } 
        return [-1, ""]
    }
    parse_side(side, steam_id) {
        const squads = side.squads
        for (let key in squads) {
            let squad = squads[key]
            for (let player of squad.players) {
                if (player.steam_id_64 === steam_id) {
                    return [player.level, player.name]
                }
            }
        }

        if ("commander" in side && side.commander !== null && "level" in side.commander) {
            if (side.commander.steam_id_64 === steam_id) {
                return [side.commander.level, side.commander.name]
            }
        }

        return [-1, null];
    }

    async kick_player(rcon_url, steam_id, steam_name, reason) {
        const postData = {
            player: steam_name,
            steam_id_64: steam_id,
            reason: reason,
            comment: "",
            duration_hours: 2,
            message: reason,
            save_message: true
        };
        let response = await axios.post(rcon_url + DO_KICK, postData, {
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
            }
        })
        console.log(response.status)
    }

    async give_vip(rcon_url, steam_id, steam_name, expiration) {
        const postData = {
            steam_id_64: steam_id,
            name: steam_name,
            expiration: expiration,
            forward: false
        }
        let response = await axios.post(rcon_url + ADD_VIPS, postData, {
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
            }
        })
        console.log(response.status)
    }

    async give_admin_cam(rcon_url, steam_id, steam_name) {
        const postData = {
            name: steam_name,
            role: "spectator",
            steam_id_64: steam_id, 
        }
        
        let response = await axios.post(rcon_url + DO_ADD_ADMIN, postData, {
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
            }
        })
        return response.status
    }

    async change_map(rcon_url, map_name) {
        const postData = {
            map_name: map_name 
        }
        
        let response = await axios.post(rcon_url + SET_MAP, postData, {
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
            }
        })
        return response.status
    }

    async get_admin_cams(rcon_url) {
        let response = null
        try {
            response = await axios.get(rcon_url + GET_ADMINS, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })

            return response.data.result
        } catch (err) {

        }
        
        return response
    }

    async remove_cam(rcon_url, steam_id) {
        const postData = {
            steam_id_64: steam_id 
        }
        try {
            let response = await axios.post(rcon_url + REMOVE_ADMIN, postData, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })
        } catch(err) {

        }
        
    }

    async set_welcome_message(rcon_url, message) {
        const postData = {
            msg: message,
            forward: false 
        }
        try {
            let response = await axios.post(rcon_url + SET_WELCOME, postData, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })
        } catch(err) {

        }
        
    }

    async set_idle_kick(rcon_url, time) {
        const postData = {
            minutes: time,
            forward: false 
        }
        try {
            let response = await axios.post(rcon_url + SET_IDLE_KICK, postData, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })
        } catch(err) {

        }
        
    }

    async get_performance(rcon_url) {
        console.log("get_performance")
        let response = null;
        try{ 
            response = await axios.get(rcon_url + TEAM_VIEW, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })  
        } catch (error) {
            return [null, null]
        }
        // console.log(response.data)
        let axis = null
        let allies = null
        if (response?.status === 200) {
            const result = response.data.result
            if ("axis" in result) { 
                if ("squads" in result.axis) {
                    console.log("checking axis")
                    axis = this.parse_performance(result.axis);
                }
            }
            if ("allies" in result) { 
                if ("squads" in result.allies) {
                    console.log("checking allies")
                    allies = this.parse_performance(result.allies);

                }
            } 
        } 
        return [axis, allies]
    }

    parse_performance(side) {
        let parsed_side = []
        const squads = side.squads
        for (let key in squads) {
            let squad = squads[key]
            for (let player of squad.players) {
                try {
                    parsed_side.push({
                        steam_id: player.steam_id_64,
                        name: player.name,
                        type: squad.type,
                        combat: player.combat,
                        offense: player.offense,
                        support: player.support,
                        kills: player.kills,
                        deaths: player.deaths,
                        role: player.role
                    }) 
                } catch (error) {
                    console.log("error parsing player for reward", error.message)
                }
            }
        }

        if ("commander" in side && side.commander !== null) {
            let player = side.commander
            // console.log(player)
            try {
                parsed_side.push({
                    steam_id: player.steam_id_64,
                    name: player.name,
                    type: "commander",
                    combat: player.combat,
                    offense: player.offense,
                    support: player.support,
                    kills: player.kills,
                    deaths: player.deaths
                })
            } catch (error) {
                console.log("error parsing commander", error.message)
            }
        }

        return parsed_side;
    }

    async set_seeding_auto_mod(rcon_url, settings) {
        try {
            let response = await axios.post(rcon_url + SEEDING_AUTO_MOD_CONFIG, settings, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })
        } catch(err) {

        }
        
    }

    async set_level_auto_mod(rcon_url, settings) {
        try {
            let response = await axios.post(rcon_url + LEVEL_AUTO_MOD_CONFIG, settings, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })
        } catch(err) {

        }
        
    }
    
    async get_level_auto_mod(rcon_url) {
        let enabled = null
        try {
            let response = await axios.get(rcon_url + GET_LEVEL_AUTO_MOD_CONFIG, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })

            enabled = response.data.result.enabled
        } catch(err) {

        }

        return enabled  
    }

    async get_top_game_killers(rcon_url) {
        try {
            let response = await axios.get(rcon_url + GET_LIVE_GAME_STATS, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })

            const players = response.data.result.stats
            const parsed_players = []
            for (let player of players) {
                let top_weapon = ""
                let top_kills = 0
                for (let weapon in player.weapons) {
                    if (player.weapons[weapon] >= top_kills) {
                        top_weapon = weapon
                        top_kills = player.weapons[weapon]
                    }
                }
                const parsed_player = {
                    name: player.player,
                    kills: player.kills,
                    deaths: player.deaths,
                    weapons: `${top_weapon}: ${top_kills}`,
                    kpm: player.kills_per_minute
                }
                parsed_players.push(parsed_player)
            }
            parsed_players.sort((a,b) => {
                if (a.kills > b.kills) {
                    return -1
                }
                if (a.kills < b.kills) {
                    return 1
                }

                return 0
            })

            let killer_text = ""
            let count = 1
            for (let ndx = 0; ndx < parsed_players.length && ndx < 25; ndx++) {
                const player = parsed_players[ndx]
                killer_text += `[${count++}] ${player.name.slice(0,15)} K: ${player.kills} D: ${player.deaths} KPM: ${player.kpm}\n`
            }

            return killer_text.slice(0,-1)
        } catch(err) {
            console.log(err)
        }

        return [] 
    }

    async get_victim(rcon_url, steam_id) {
        try {
            let response = await axios.get(rcon_url + GET_LIVE_GAME_STATS, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })

            const player = response.data.result.stats.filter(p => p.steam_id_64 === steam_id)
            let message = "_________Victims_________\n"
            if (player.length > 0) {
                let victims = player[0].most_killed
                const sortedMostKilled = Object.fromEntries(
                    Object.entries(victims).sort((a, b) => b[1] - a[1])
                );
                for (const vic in sortedMostKilled) {
                    message += `${vic}: ${sortedMostKilled[vic]}\n`
                }
                message += "\n_________Nemeses________\n"
                let nemesis = player[0].death_by
                const sortedMostDeathBy = Object.fromEntries(
                    Object.entries(nemesis).sort((a, b) => b[1] - a[1])
                );
                for (const nem in sortedMostDeathBy) {
                    message += `${nem}: ${sortedMostDeathBy[nem]}\n`
                }
                return message
            
            }
        } catch(err) {
            console.log(err)
        }

        return "Unable to retrieve player data" 
    } 

    async get_weapons(rcon_url, steam_id) {
        try {
            let response = await axios.get(rcon_url + GET_LIVE_GAME_STATS, {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
                }
            })

            const player = response.data.result.stats.filter(p => p.steam_id_64 === steam_id)
            let message = "_________Kills_________\n"
            if (player.length > 0) {
                let kills = player[0].weapons
                const sortedMostKilled = Object.fromEntries(
                    Object.entries(kills).sort((a, b) => b[1] - a[1])
                );
                for (const weapon in sortedMostKilled) {
                    message += `${weapon}: ${sortedMostKilled[weapon]}\n`
                }
                message += "\n_________Deaths________\n"
                let deaths = player[0].death_by_weapons
                const sortedMostDeathBy = Object.fromEntries(
                    Object.entries(deaths).sort((a, b) => b[1] - a[1])
                );
                for (const weapon in sortedMostDeathBy) {
                    message += `${weapon}: ${sortedMostDeathBy[weapon]}\n`
                }
                return message
            
            }
        } catch(err) {
            console.log(err)
        }

        return "Unable to retrieve player data" 
    } 

    // async message_player(rcon_url, steam_id, name, expiration, reason) {
    //     const API_KEY = process.env.API_KEY
    //     const postData = {
    //         comment: "",
    //         duration_hours: 2,
    //         message: message,
    //         player: dead_player,
    //         reason: message,
    //         save_message: true,
    //         steam_id_64: steam_id
    //     };
    //     // console.log(rcon_url)
    //     // console.log(rcon_url + SEND_MESSAGE)
    //     // console.log(postData)
    //     // console.log(API_KEY)
    //     // Axios POST request with Authorization header and JSON body
    //     let response = await axios.post(rcon_url + SEND_MESSAGE, postData, {
    //         headers: {
    //             'Authorization': `Bearer ${API_KEY}`,
    //             'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
    //         }
    //     })
    //     console.log(response.status)
    // }
}

async function get_who_killed_me(rcon_url, steam_id) {
    const API_KEY = process.env.API_KEY

    // The data to be sent in the request body
    const postData = {
        end: 100,
        filter_action: ["KILL"],
        filter_player: [],
        inclusive_filter: true
    };

    // Axios POST request with Authorization header and JSON body
    let response = await axios.post(rcon_url + GET_RECENT_LOGS, postData, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
        }
    })

    console.log(response.status)
    // console.log(response.data)
    // console.log(response.data.result.logs)

    if (response?.status === 200 && Array.isArray(response?.data?.result?.logs)) {
        for (const log of response.data.result.logs) {
            if (log.steam_id_64_2 === steam_id) {
                let event_time = log.timestamp_ms
                let diff = Math.floor((parseInt(Date.now(), 10) - parseInt(event_time, 10)) / 1000)
                let player = log.player
                let parts = log.line_without_time.split(" with ");
                let weapon = parts[parts.length - 1];
                return [diff, player, weapon]
            }
        }
        return ["", "", "", ""]
    } else {
        return ["", "", "", ""]
    }
}

async function message_player(rcon_url, steam_id, message, dead_player) {
    const API_KEY = process.env.API_KEY
    const postData = {
        comment: "",
        duration_hours: 2,
        message: message,
        player: dead_player,
        reason: message,
        save_message: true,
        steam_id_64: steam_id
    };
    // console.log(rcon_url)
    // console.log(rcon_url + SEND_MESSAGE)
    // console.log(postData)
    // console.log(API_KEY)
    // Axios POST request with Authorization header and JSON body
    let response = await axios.post(rcon_url + SEND_MESSAGE, postData, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json' // This is usually not needed as axios sets it automatically for JSON bodies
        }
    })
    console.log(response.status)
}

module.exports = { get_who_killed_me, message_player, Rcon };
