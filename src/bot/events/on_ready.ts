import type { event_type } from "../../../types/event_type";
import pkg from "../../../package.json";
import { ActivityType, ChannelType, VoiceChannel } from "discord.js";
import { config } from "../../shared";
import { kxsNetwork } from "../../kxs";
import { intervals } from "../..";

export const ready: event_type = {
    name: "ready",
    once: true,
    async function(client, x, y, z) {
        kxsNetwork.connect();

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
            state: `${kxsNetwork.getOnlineCount()} players online`,
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

        async function counters() {
            let guilds = client.database.table("guilds");
            let guilds_in_db = await guilds.all();

            guilds_in_db
                .filter(v => Number(v.id))
                .map(x => {
                    let online_counter = x.value?.online_counter as { channel: string, name: string } | undefined;
                    if (online_counter) {
                        let channel = client.channels.cache.get(online_counter.channel);
                        if (!channel || channel.type !== ChannelType.GuildVoice) return;

                        let voice_channel = channel as VoiceChannel;
                        voice_channel.setName(`${online_counter.name} (${kxsNetwork.getOnlineCount()})`);
                    }
                })
        }

        await owners(); await counters();
        intervals.push(setInterval(counters, 15 * 60 * 1000));
    },
}