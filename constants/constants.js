// constants.js
const RCON_URL = 'https://rcon.syn.team';
const EVENT_RCON_URL = 'https://event-rcon.syn.team';
const GET_PUBLIC_INFO = "/api/public_info"
const GET_PLAYERS = "/api/get_players"
const GET_VIPS = "/api/get_vip_ids"
const ADD_VIPS = "/api/do_add_vip"
const SEND_MESSAGE = "/api/do_message_player"
const GET_TEAM_VIEW = "/api/get_team_view"
const SET_WELCOME = "/api/set_welcome_message"
const GET_RECENT_LOGS = "/api/get_recent_logs"
const MAP_ROTATION = "/api/get_map_rotation"
const DO_KICK = "/api/do_kick"
const DO_ADD_ADMIN = "/api/do_add_admin"
const SET_MAP = "/api/set_map"
const SWITCH_PLAYER = "/api/do_switch_player_now"
const GET_ADMINS = "/api/get_admin_ids"
const REMOVE_ADMIN = "/api/do_remove_admin"
const TEAM_VIEW = "/api/get_team_view"
const SEEDING_AUTO_MOD_CONFIG = "/api/set_auto_mod_seeding_config"
const LEVEL_AUTO_MOD_CONFIG = "/api/set_auto_mod_level_config"
const GET_LEVEL_AUTO_MOD_CONFIG = "/api/get_auto_mod_level_config"
const GET_LIVE_GAME_STATS = "/api/get_live_game_stats"

const SEEDING_THRESHOLD = 30
const LEVEL_KICK_THRESHOLD = 70
const LEVEL_CAP = 25
const MATCH_END_THRESHOLD = 60




const UNIX_WEEK = 604800

const IDLE_KICK_ON = 85
const IDLE_KICK_OFF = 70
const SET_IDLE_KICK = "/api/set_idle_autokick_time"

const MAPS = {
    foy: "foy_warfare",
    smdm: "stmariedumont_warfare",
    hurt: "hurtgenforest_warfare_V2",
    utah: "utahbeach_warfare",
    sme: "stmereeglise_warfare",
    purp: "purpleheartlane_warfare",
    hill: "hill400_warfare",
    car: "carentan_warfare",
    kursk: "kursk_warfare",
    stal: "stalingrad_warfare",
    rem: "remagen_warfare",
    foyn: "foy_warfare_night",
    hurtn: "hurtgenforest_warfare_V2_night",
    kurskn: "kursk_warfare_night",
    purpn: "purpleheartlane_warfare_night",
    remn: "remagen_warfare_night",
    omaha: "omahabeach_warfare",
    khar: "kharkov_warfare",
    elal: "elalamein_warfare",
    driel: "driel_warfare"
}

const SEEDING_AUTO_MOD = {
    "enabled": true,
    "discord_webhook_url": "https://discord.com/api/webhooks/...",
    "announcement_enabled": true,
    "announcement_message": "Seeding Rules are in effect until 30v30.\n\n1. Only fight over the midpoint.\n 2. No tanks, artillery, bombing runs, strafing runs, or precision strikes.\n\nAutomatic VIP applied for seeding.",
    "number_of_warnings": 1,
    "warning_message": "Warning, {player_name}! You violate seeding rules on this server: {violation}\nYou will be punished after {max_warnings} warnings (you already received {received_warnings}), then kicked.\nNext check will happen automatically in {next_check_seconds}s.",
    "warning_interval_seconds": 10,
    "number_of_punishments": 10,
    "punish_message": "You violated seeding rules on this server: {violation}.\nYou're being punished by a bot ({received_punishes}/{max_punishes}).\nNext check in {next_check_seconds} seconds",
    "punish_interval_seconds": 15,
    "kick_after_max_punish": true,
    "kick_grace_period_seconds": 1,
    "kick_message": "You violated seeding rules on this server.\nYour grace period of {kick_grace_period}s has passed.\nYou failed to comply with the previous warnings.",
    "disallowed_roles": {
        "min_players": 5,
        "max_players": 30,
        "roles": {},
        "violation_message": "{role} are not allowed when server is seeding"
    },
    "disallowed_weapons": {
        "min_players": 0,
        "max_players": 80,
        "weapons": {
            "T70": "Tanks",
            "IS-1": "Tanks",
            "BA-10": "Tanks",
            "PAK 40": "Tanks",
            "T34/76": "Tanks",
            "Firefly": "Tanks",
            "HULL DT": "Tanks",
            "Cromwell": "Tanks",
            "Tetrarch": "Tanks",
            "HULL BESA": "Tanks",
            "HULL MG34": "Tanks",
            "COAXIAL DT": "Tanks",
            "HULL M1919": "Tanks",
            "BOMBING RUN": "Offensive Commander Abilities",
            "Stuart M5A1": "Tanks",
            "COAXIAL BESA": "Tanks",
            "COAXIAL MG34": "Tanks",
            "M8 Greyhound": "Tanks",
            "STRAFING RUN": "Offensive Commander Abilities",
            "COAXIAL M1919": "Tanks",
            "HULL DT [IS-1]": "Tanks",
            "Sherman M4A3E2": "Tanks",
            "Sd.Kfz.234 Puma": "Tanks",
            "45MM M1937 [T70]": "Tanks",
            "COAXIAL DT [T70]": "Tanks",
            "D-5T 85MM [IS-1]": "Tanks",
            "HULL BESA 7.92mm": "Tanks",
            "HULL DT [T34/76]": "Tanks",
            "PRECISION STRIKE": "Offensive Commander Abilities",
            "Sd.Kfz.121 Luchs": "Tanks",
            "19-K 45MM [BA-10]": "Tanks",
            "COAXIAL DT [IS-1]": "Tanks",
            "Sherman M4A3(75)W": "Tanks",
            "COAXIAL DT [BA-10]": "Tanks",
            "QF 75MM [Cromwell]": "Tanks",
            "Sd.Kfz.171 Panther": "Tanks",
            "Sd.Kfz.181 Tiger 1": "Tanks",
            "Sherman M4A3E2(76)": "Tanks",
            "57MM CANNON [ZiS-2]": "Tanks",
            "76MM ZiS-5 [T34/76]": "Tanks",
            "COAXIAL DT [T34/76]": "Tank",
            "75MM CANNON [PAK 40]": "Tanks",
            "HULL BESA [Cromwell]": "Tanks",
            "Sd.Kfz.161 Panzer IV": "Tanks",
            "155MM HOWITZER [M114]": "Arty",
            "57MM CANNON [M1 57mm]": "Tanks",
            "COAXIAL BESA [Daimler]": "Tanks",
            "M6 37mm [M8 Greyhound]": "Tanks",
            "QF 2-POUNDER [Daimler]": "Tanks",
            "150MM HOWITZER [sFH 18]": "Arty",
            "COAXIAL BESA [Cromwell]": "Tanks",
            "COAXIAL BESA [Tetrarch]": "Tanks",
            "COAXIAL M1919 [Firefly]": "Tanks",
            "QF 17-POUNDER [Firefly]": "Tanks",
            "QF 2-POUNDER [Tetrarch]": "Tanks",
            "HULL M1919 [Stuart M5A1]": "Tanks",
            "37MM CANNON [Stuart M5A1]": "Tanks",
            "COAXIAL M1919 [Stuart M5A1]": "Tanks",
            "HULL M1919 [Sherman M4A3E2]": "Tanks",
            "M2 Browning [M3 Half-track]": "Tanks",
            "QF 6-POUNDER [QF 6-Pounder]": "Tanks",
            "75MM M3 GUN [Sherman M4A3E2]": "Tanks",
            "COAXIAL M1919 [M8 Greyhound]": "Tanks",
            "122MM HOWITZER [M1938 (M-30)]": "Arty",
            "MG 42 [Sd.Kfz 251 Half-track]": "Tanks",
            "QF 25-POUNDER [QF 25-Pounder]": "Tanks",
            "20MM KWK 30 [Sd.Kfz.121 Luchs]": "Tanks",
            "COAXIAL M1919 [Sherman M4A3E2]": "Tanks",
            "COAXIAL MG34 [Sd.Kfz.234 Puma]": "Tanks",
            "HULL M1919 [Sherman M4A3(75)W]": "Tanks",
            "HULL MG34 [Sd.Kfz.171 Panther]": "Tanks",
            "HULL MG34 [Sd.Kfz.181 Tiger 1]": "Tanks",
            "50mm KwK 39/1 [Sd.Kfz.234 Puma]": "Tanks",
            "75MM CANNON [Sherman M4A3(75)W]": "Tanks",
            "COAXIAL MG34 [Sd.Kfz.121 Luchs]": "Tanks",
            "HULL M1919 [Sherman M4A3E2(76)]": "Tanks",
            "75MM CANNON [Sd.Kfz.171 Panther]": "Tanks",
            "76MM M1 GUN [Sherman M4A3E2(76)]": "Tanks",
            "HULL MG34 [Sd.Kfz.161 Panzer IV]": "Tanks",
            "COAXIAL M1919 [Sherman M4A3(75)W]": "Tanks",
            "COAXIAL MG34 [Sd.Kfz.171 Panther]": "Tanks",
            "COAXIAL MG34 [Sd.Kfz.181 Tiger 1]": "Tanks",
            "75MM CANNON [Sd.Kfz.161 Panzer IV]": "Tanks",
            "COAXIAL M1919 [Sherman M4A3E2(76)]": "Tanks",
            "88 KWK 36 L/56 [Sd.Kfz.181 Tiger 1]": "Tanks",
            "COAXIAL MG34 [Sd.Kfz.161 Panzer IV]": "Tanks",
            "HULL BESA 7.92mm [Churchill Mk.III]": "Tanks",
            "COAXIAL BESA 7.92mm [Churchill Mk.III]": "Tanks",
            "OQF 6 - POUNDER Mk.V [Churchill Mk.III]": "Tanks"
        },
        "violation_message": "{weapon} are not allowed when server is seeding"
    },
    "enforce_cap_fight": {
        "min_players": 0,
        "max_players": 80,
        "max_caps": 3,
        "skip_warning": true,
        "violation_message": "Attacking 4th cap while seeding is not allowed"
    },
    "errors_as_json": true
}

const LEVEL_AUTO_MOD = {
    "enabled": false,
    "discord_webhook_url": "https://discord.com/api/webhooks/...",
    "announcement_enabled": true,
    "announcement_message": "This server is under level thresholds control.\n\n{min_level_msg}{max_level_msg}{level_thresholds_msg}\nThanks for understanding.",
    "force_kick_message": "You violated level thresholds rules on this server: {violation}.",
    "min_level": 25,
    "min_level_message": "Access to this server is not allowed under level {level}",
    "max_level": 0,
    "max_level_message": "Access to this server is not allowed over level {level}",
    "violation_message": "{role} are not allowed under level {level}",
    "level_thresholds": {
        "armycommander": {
            "label": "Commanders",
            "min_players": 60,
            "min_level": 70
        },
        "officer": {
            "label": "Squad Leaders",
            "min_players": 60,
            "min_level": 50
        },
        "spotter": {
            "label": "Spotters",
            "min_players": 60,
            "min_level": 60
        },
        "tankcommander": {
            "label": "Tank Commnaders",
            "min_players": 60,
            "min_level": 60
        }
    },
    "number_of_warnings": 1,
    "warning_message": "Warning, {player_name}! You violate level thresholds rules on this server: {violation}\nYou will be punished after next if you do not remove yourself from this role.",
    "warning_interval_seconds": 30,
    "number_of_punishments": 2,
    "punish_message": "You violated level thresholds rules on this server: {violation}.\nYou're being punished by a bot ({received_punishes}/{max_punishes}).\nNext check in {next_check_seconds} seconds",
    "punish_interval_seconds": 60,
    "kick_after_max_punish": true,
    "kick_grace_period_seconds": 60,
    "kick_message": "You violated level thresholds rules on this server: {violation}.\nYour grace period of {kick_grace_period}s has passed.\nYou failed to comply with the previous warnings."
  }


module.exports = { RCON_URL, GET_RECENT_LOGS, SEND_MESSAGE, GET_PUBLIC_INFO, SEEDING_THRESHOLD, GET_PLAYERS, GET_VIPS, ADD_VIPS, TEAM_VIEW, LEVEL_CAP, LEVEL_KICK_THRESHOLD, DO_KICK, UNIX_WEEK, MATCH_END_THRESHOLD, EVENT_RCON_URL, DO_ADD_ADMIN, MAPS, SET_MAP, GET_ADMINS, REMOVE_ADMIN, SET_WELCOME, IDLE_KICK_ON, IDLE_KICK_OFF, SET_IDLE_KICK, SEEDING_AUTO_MOD, SEEDING_AUTO_MOD_CONFIG, LEVEL_AUTO_MOD_CONFIG, LEVEL_AUTO_MOD, GET_LEVEL_AUTO_MOD_CONFIG, GET_LIVE_GAME_STATS};
