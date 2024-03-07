# Overview
This is a mess the bot was originally created to autoban people who were reported to the bunker. This narrow scope cause a simple design that didn't scale well. At some point i got tired of paying for battle metrics and introduced some feature creep. The rush to get it done before the next battlemetric rebill cause the "design pattern" ended in an abomination 

# Features
### Auto Blacklist Bunker Cheaters
Assumption is you have a channel in your discord where the follow reports from the bunker. Change the channel id and the bot id to be that which are in your discord. When a message is posted, it will check to see if they are vip. If they are it will ping a role, that for us was Game Server Admin. It let them know a VIP has been report and took no action. Otherwise it would blacklist the player and leave a comment that would link to this bunker message

<img width="469" alt="Screenshot 2024-03-06 at 3 36 01 PM" src="https://github.com/Craven73/hll_rcon_discord_companion/assets/50681292/f6d28363-39e9-4dd5-8b97-e79a41a40236">

### Chat Handler
Uses the chat webhook of the rcon responds to messages from the appropriate bot in the appropriate channel. Uses this webhook to get steam id in embed.

__**Pub Server Commands:**__
- `!wkm` (old implementation) - get who killed you last
- `!leader` - Get rcon top 20 killers
- `!victims` - Get all the players you have killed and killed by
- `!weapons` - Get all the weapons you have been killed with and by

__**Event Server Commands**__
- `!cam` - Give admin cam
- `!map` <map_name> - flip map to map name
- `!toggle` - enable and disable command mode
- `!removecam` - remove all admin cams

### Connect Handler 
- Handles set idle kick so you don't have to pay for BM
- When the player count is greater than 85 enable level automod

### Teamswitch Handler
- Check to see if server is no longer seeded enable seeding automod 
- If already seeded nothing happens
- If the server has just crossed seeding threshold
  - Award vip to all seeders
  - Notify server is seeded
  - Disable seeding auto mod rules 

### Match End Handler
When the match ends check a series of conditions and award vip to all those who qualify. 
