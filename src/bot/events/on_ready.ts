import type { event_type } from "../../../types/event_type";
import pkg from "../../../package.json";
import { ActivityType } from "discord.js";
import { config } from "../../shared";

export const ready: event_type = {
    name: "ready",
    once: true,
    async function(client, x, y, z) {
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
        });

        async function owners() {
            let owner_table = client.database.table("owners");
            let owners_in_db = await owner_table.all() || [];

            let all_owners_in_config = config.OWNERS;
            let db_owner_ids = owners_in_db.map(x => x.id);

            let concatened_owners = [...new Set([...db_owner_ids, ...all_owners_in_config])];

            client.owners = concatened_owners;
            for (let owner of concatened_owners) {
                await owner_table.set(owner, true)
            }
        }

        await owners();
    },
}