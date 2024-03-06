const { get_who_killed_me, message_player } = require('../../rcon/rcon');


async function wkm(rcon_url, steam_id, steam_name) {
    console.log("WKM")
    let [diff, player, weapon, dead_player] = await get_who_killed_me(rcon_url, steam_id);

    const message_contents = `You were last killed ${diff} seconds ago.

Killed by ${player}
Using ${weapon}

If you are still downed your most recent death will not show.`

    message_player(rcon_url, steam_id, message_contents, steam_name)
    console.log(message_contents)
}

module.exports = { wkm };