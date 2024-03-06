const axios = require('axios');
// require('dotenv').config();

class Webhook {

    constructor() {
        this.seederboard_webhook = process.env.SEEDERBOARD_WEBHOOK
        this.seederboard_message = process.env.SEEDERBOARD_MESSAGE

        this.killer_webhook = process.env.KILLER_WEBHOOK
        this.killer_message = process.env.KILLER_MESSAGE

        this.reward_webhook = process.env.REWARD_WEBHOOK

        this.big_brother_webhook = process.env.BIG_BROTHER_WEBHOOK
    }


    update_seeders(leaders, three_months, all_time) {

        let seederboard = "__Two Weeks__\n\n\`\`\`md\n"
        let count 
        for (let ndx = 0; ndx < leaders.length; ndx++) {
            let seeder = leaders[ndx]
            let seed_hours = Math.floor(seeder.seed_time / 3600)
            let seed_secs = seeder.seed_time % 3600
            let seed_mins = Math.floor(seed_secs / 60)
            seederboard += `[${ndx + 1}][${seeder.steam_name}]: ${seeder.games_seeded} | ${seed_hours}h ${seed_mins}\n`
        }
        seederboard += `\`\`\`\n\n`
        seederboard += "__Three Months__\n\n\`\`\`md\n"
        for (let ndx = 0; ndx < three_months.length; ndx++) {
            let seeder = three_months[ndx]
            let seed_hours = Math.floor(seeder.seed_time / 3600)
            let seed_secs = seeder.seed_time % 3600
            let seed_mins = Math.floor(seed_secs / 60)
            seederboard += `[${ndx + 1}][${seeder.steam_name}]: ${seeder.games_seeded} | ${seed_hours}h ${seed_mins}\n`
        }

        seederboard += `\`\`\`\n\n`
        seederboard += "__Since Seederboard Creation__\n\n\`\`\`md\n"
        for (let ndx = 0; ndx < all_time.length; ndx++) {
            let seeder = all_time[ndx]
            let seed_hours = Math.floor(seeder.seed_time / 3600)
            let seed_secs = seeder.seed_time % 3600
            let seed_mins = Math.floor(seed_secs / 60)
            seederboard += `[${ndx + 1}][${seeder.steam_name}]: ${seeder.games_seeded} | ${seed_hours}h ${seed_mins}\n`
        }

        seederboard += `\`\`\`\nLast updated <t:${Math.floor(Date.now() / 1000)}:R>`


        const embed = {
            title: "Seederboard",
            description: seederboard,
            color: 13734400, // Decimal color value
            footer: {
                name: "Author Name",
                icon_url: "https://example.com/icon.png" // Optional
            },
            // You can also add other properties like 'footer', 'image', 'thumbnail', etc.
        };

        const message = {
            embeds: [embed]
            // You can add more properties here (like username, avatar_url, embeds, etc.)
        };
        
        axios.patch(this.seederboard_webhook + "/messages/" + this.seederboard_message, message)
            .then(response => {
                console.log('Message sent successfully');
            })
            .catch(error => {
                console.error('Error sending message', error);
            });
    }


    update_killer(killers) {
        if (killers.length < 25) {
            return
        }

        let killer_text = "\`\`\`md\n"
            
        for (let ndx = 0; ndx < 25; ndx++) {
            killer_text += `[${ndx}][${killers[ndx].steam_name}]: ${killers[ndx].kills}`

            if (ndx < 24) {
                killer_text += "\n"
            }
        }
        killer_text += `\n\`\`\`\nLast updated <t:${Math.floor(Date.now() / 1000)}:R>`
    

        const embed = {
            title: "Top 25 Killers Last 7 Days",
            description: killer_text,
            color: 13734400, // Decimal color value
            // You can also add other properties like 'footer', 'image', 'thumbnail', etc.
        };

        const message = {
            embeds: [embed]
            // You can add more properties here (like username, avatar_url, embeds, etc.)
        };
        
        axios.patch(this.killer_webhook + "/messages/" + this.killer_message, message)
            .then(response => {
                console.log('Message sent successfully');
            })
            .catch(error => {
                console.error('Error sending message', error);
            });
    }

    performance_reward(title, side) {
        let description = ""
        for (let player of side) {
            description += `**__Player__**: ${player.name}(${player.steam_id})\n\`\`\`json\n${JSON.stringify(player)}\n\`\`\`\n\n`
        }
        const embed = {
            title: title,
            description: description,
            color: 15844367, // Decimal color value
            footer: {
                name: "Author Name",
                icon_url: "https://example.com/icon.png" // Optional
            },
            // You can also add other properties like 'footer', 'image', 'thumbnail', etc.
        };

        const message = {
            embeds: [embed]
            // Yo
        }

        axios.post(this.reward_webhook, message)
        .then(response => {
            console.log('Message sent successfully');
        })
        .catch(error => {
            console.error('Error sending message', error);
        });
            
    }

    post_audit_log(log) {
        const messageData = {
            content: log,
            // You can add more properties according to Discord's webhook format
        };
        
        axios.post(this.big_brother_webhook, messageData)
            .then(response => {
                console.log('Message sent successfully:', response.data);
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
    }
}



module.exports = { Webhook };