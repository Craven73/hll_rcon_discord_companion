const { Client } = require('pg');

const { IS_SEEDED, SET_NOT_SEEDED, SET_SEEDED, SAVE_SEEDERS, CLEAN_SEEDERS, SELECT_TWO_WEEKS, GET_STEAM_NAME_BY_ID, AUTHORIZED_USERS, COMMAND_MODE, SET_COMMAND_MODE, TOP_TEN_KILLS, SELECT_THREE_MONTHS_SEED,SELECT_ALL_TIME_SEED} = require("./queries")
const { UNIX_WEEK } = require("../constants/constants")

class Data {
    hello() {
        console.log("hello from DB")
    }
    async seeding_db_connect() {
        // Configure your database connection here
        const client = new Client({
            user: process.env.SEEDING_POSTGRES_USERNAME,
            host: process.env.SEEDING_POSTGRES_URL, // or your database server's address
            database: process.env.SEEDING_POSTGRES_DB,
            password: process.env.SEEDING_POSTGRES_PASSWORD,
            port: process.env.SEEDING_POSTGRES_PORT, // default port for PostgreSQL
        });
        
        // Connect to the database
        await client.connect();
        return client
    }
    
    async rcon_db_connect() {
        // Configure your database connection here
        const client = new Client({
            user: process.env.RCON_POSTGRES_USERNAME,
            host: process.env.RCON_POSTGRES_URL, // or your database server's address
            database: process.env.RCON_POSTGRES_DB,
            password: process.env.RCON_POSTGRES_PASSWORD,
            port: process.env.RCON_POSTGRES_PORT, // default port for PostgreSQL
        });
        
        // Connect to the database
        await client.connect();
        return client
    
        
    }

    async is_seeded() {
        const seed_db = await this.seeding_db_connect()
        let res = null;
        try {
            res = await seed_db.query(IS_SEEDED, ["Server 1"]);
        } catch (err) {
            console.error('Error during database operation:', err);
        } finally {
            // Close the connection
            seed_db.end();
        }
    
        if (res.rows.length >= 1) {
            return res.rows[0].seeded
        } else {
            return false
        }
    }

    async set_not_seeded() {
        const seed_db = await this.seeding_db_connect()
        let res = null;
        try {
            res = await seed_db.query(SET_NOT_SEEDED, ["Server 1"]);
        } catch (err) {
            console.error('Error during database operation:', err);
        } finally {
            // Close the connection
            seed_db.end();
        }
    }

    async set_seeded() {
        const seed_db = await this.seeding_db_connect()
        let res = null;
        try {
            res = await seed_db.query(SET_SEEDED, ["Server 1"]);
        } catch (err) {
            console.error('Error during database operation:', err);
        } finally {
            // Close the connection
            seed_db.end();
        }
    }

    async record_seeders(players, game_start_time) {
        const seed_db = await this.seeding_db_connect()
        let res = null;
        for (const player of players) {
            try {
                res = await seed_db.query(SAVE_SEEDERS, [player.steam_id, player.name, player.seed_time, game_start_time]);
            } catch (err) {
                console.error('Error during database operation:', err);
            } 
        }

        try {
            res = await seed_db.query(CLEAN_SEEDERS);
        } catch (err) {
            console.error('Error during database operation:', err);
        } 
        seed_db.end();
        
    }

    async get_seeding_leaders() {
        const seed_db = await this.seeding_db_connect()
        const rcon_db = await this.rcon_db_connect()
        let res = null;
        console.log(Math.floor(new Date().getTime() / 1000) - 2 * UNIX_WEEK)
        try {
            res = await seed_db.query(SELECT_TWO_WEEKS, [Math.floor(new Date().getTime() / 1000) - 2 * UNIX_WEEK]);
        } catch (err) {
            console.error('Error during database operation:', err);
        } 
        const two_weeks = []
        for (const seeder of res.rows) {
            let steam_name = ""
            try {
                res = await rcon_db.query(GET_STEAM_NAME_BY_ID, [seeder.steam_id])
                steam_name = res.rows[0].name 
            } catch (err) {
                console.error('Error during database operation:', err);
            }

            two_weeks.push({
                steam_name: steam_name,
                seed_time: seeder.total_seed_time,
                games_seeded: seeder.games_seeded
            })
            
        }

        try {
            res = await seed_db.query(SELECT_THREE_MONTHS_SEED);
        } catch (err) {
            console.error('Error during database operation:', err);
        } 
        const three_months = []
        for (const seeder of res.rows) {
            let steam_name = ""
            try {
                res = await rcon_db.query(GET_STEAM_NAME_BY_ID, [seeder.steam_id])
                steam_name = res.rows[0].name 
            } catch (err) {
                console.error('Error during database operation:', err);
            }

            three_months.push({
                steam_name: steam_name,
                seed_time: seeder.total_seed_time,
                games_seeded: seeder.games_seeded
            })
            
        }

        try {
            res = await seed_db.query(SELECT_ALL_TIME_SEED);
        } catch (err) {
            console.error('Error during database operation:', err);
        } 
        const all_time = []
        for (const seeder of res.rows) {
            let steam_name = ""
            try {
                res = await rcon_db.query(GET_STEAM_NAME_BY_ID, [seeder.steam_id])
                steam_name = res.rows[0].name 
            } catch (err) {
                console.error('Error during database operation:', err);
            }

            all_time.push({
                steam_name: steam_name,
                seed_time: seeder.total_seed_time,
                games_seeded: seeder.games_seeded
            })
            
        }

        

        seed_db.end();
        rcon_db.end()

        return [two_weeks, three_months, all_time]
    }

    async get_steam_name_by_id(steam_id) {
        const rcon_db = await this.rcon_db_connect()
        let steam_name = null
        try {
            const res = await rcon_db.query(GET_STEAM_NAME_BY_ID, [steam_id])
            steam_name = res.rows[0].name 
        } catch (err) {
            console.error('Error during database operation:', err);
        }

        rcon_db.end()

        return steam_name
    }   

    async get_authorized_users() {
        const seed_db = await this.seeding_db_connect()
        let auth_users = []
        try {
            const res = await seed_db.query(AUTHORIZED_USERS)
            for (const row of res.rows) {
                auth_users.push(row.steam_id)
            }
        } catch (err) {
            console.error('Error during database operation:', err);
        }

        seed_db.end()

        return auth_users
    } 
    async get_command_mode() {
        const seed_db = await this.seeding_db_connect()
        let enabled = null
        try {
            const res = await seed_db.query(COMMAND_MODE)
            enabled = res.rows[0].enabled

        } catch (err) {
            console.error('Error during database operation:', err);
        }

        seed_db.end()

        return enabled
    } 

    async set_command_mode(value) {
        const seed_db = await this.seeding_db_connect()
        let enabled = null
        try {
            const res = await seed_db.query(SET_COMMAND_MODE, [value])

        } catch (err) {
            console.error('Error during database operation:', err);
        }

        seed_db.end()

    } 

    async get_top_killers() {
        const rcon_db = await this.rcon_db_connect()
        let res = null;
        try {
            res = await rcon_db.query(TOP_TEN_KILLS);
        } catch (err) {
            console.error('Error during database operation:', err);
        } 
        const top_killers = []
        for (const killer of res.rows) {
            let steam_name = ""
            try {
                res = await rcon_db.query(GET_STEAM_NAME_BY_ID, [killer.steam_id_64])
                steam_name = res.rows[0].name 
            } catch (err) {
                console.error('Error during database operation:', err);
            }

            top_killers.push({
                steam_name: steam_name,
                kills: killer.total_kills
            })
            
        }

        rcon_db.end()

        return top_killers
    }
}


module.exports = { Data };