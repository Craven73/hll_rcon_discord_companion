# Overview
This is a mess the bot was originally created to autoban people who were reported to the bunker. This narrow scope cause a simple design that didn't scale well. At some point i got tired of paying for battle metrics and introduced some feature creep. The rush to get it done before the next battlemetric rebill cause the "design pattern" ended in an abomination 

# Features
### Auto Blacklist Bunker Cheaters
Assumption is you have a channel in your discord where the follow reports from the bunker. Change the channel id and the bot id to be that which are in your discord. When a message is posted, it will check to see if they are vip. If they are it will ping a role, that for us was Game Server Admin. It let them know a VIP has been report and took no action. Otherwise it would blacklist the player and leave a comment that would link to this bunker message
