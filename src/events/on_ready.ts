import type { event_type } from "../../types/event_type";
import pkg from "../../package.json";
import { ActivityType } from "discord.js";

export const ready: event_type = {
    name: "ready",
    once: true,
    function(client, x, y, z) {
        console.log(
            `Kxs Bot v${pkg.version}
 Name: ${client.user?.username}
 Tag: ${client.user?.tag}
 Id: ${client.user?.id}

 Guild(s): ${client.guilds.cache.size}
 Link: https://discord.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot&permissions=0
`
        )

        client.user?.setActivity({
            name: "kxs.rip",
            state: "test",
            type: ActivityType.Streaming,
            url: "https://twitch.tv/anaissaraiva"
        })
    },
}