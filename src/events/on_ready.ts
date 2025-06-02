import type { event_type } from "../../types/event_type";
import pkg from "../../package.json";

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
`
        )
    },
}