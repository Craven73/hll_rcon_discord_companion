// constants.js
const IS_SEEDED = 'SELECT seeded from seeded where server = $1';
const SET_NOT_SEEDED = "UPDATE seeded SET seeded=false WHERE server=$1"
const SET_SEEDED = "UPDATE seeded SET seeded=true WHERE server=$1"
const SAVE_SEEDERS = "INSERT INTO recorded_seeds (steam_id, steam_name, play_time, game_start_time) VALUES ($1, $2, $3, $4)"
const CLEAN_SEEDERS = "delete from recorded_seeds a using recorded_seeds b where a.steam_id = b.steam_id and a.game_start_time = b.game_start_time and a.id < b.id"
const SELECT_ALL_TIME_SEED = "SELECT steam_id, sum(play_time) as total_seed_time, count(game_start_time) as games_seeded FROM recorded_seeds GROUP BY steam_id ORDER BY games_seeded DESC, total_seed_time DESC LIMIT 20"
const SELECT_TWO_WEEKS = "SELECT steam_id, sum(play_time) as total_seed_time, count(game_start_time) as games_seeded FROM recorded_seeds where game_start_time >= $1 GROUP BY steam_id ORDER BY games_seeded DESC, total_seed_time DESC LIMIT 20"
const SELECT_THREE_MONTHS_SEED = "SELECT steam_id, sum(play_time) as total_seed_time, count(game_start_time) as games_seeded FROM recorded_seeds where to_timestamp(game_start_time) AT TIME ZONE 'UTC' >= now() - INTERVAL '3 months'  GROUP BY steam_id ORDER BY games_seeded DESC, total_seed_time DESC LIMIT 20"

const GET_STEAM_NAME_BY_ID = "select name, last_seen, steam_id_64 from player_names as pn join steam_id_64 as si on pn.playersteamid_id = si.id where si.steam_id_64 = $1 order by last_seen desc limit 1"

const AUTHORIZED_USERS = "select * from authorized_users"
const COMMAND_MODE = "select enabled from command_mode where server = 'Event'"
const SET_COMMAND_MODE = "update command_mode set enabled = $1 where server = 'Event'"
const TOP_TEN_KILLS = "select s_id.steam_id_64,ps.playersteamid_id, sum(kills) as total_kills from player_stats as ps join map_history as mh on ps.map_id = mh.id join steam_id_64 as s_id on ps.playersteamid_id = s_id.id where mh.start >= now() - INTERVAL '1 week' group by s_id.steam_id_64, ps.playersteamid_id order by total_kills desc limit 25"



module.exports = { IS_SEEDED, SET_NOT_SEEDED, SET_SEEDED, SAVE_SEEDERS, CLEAN_SEEDERS, SELECT_TWO_WEEKS, GET_STEAM_NAME_BY_ID, AUTHORIZED_USERS, COMMAND_MODE,  SET_COMMAND_MODE, TOP_TEN_KILLS, SELECT_THREE_MONTHS_SEED, SELECT_ALL_TIME_SEED};
