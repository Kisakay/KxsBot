import { EmbedBuilder, Message } from "discord.js";
import type { ColorResolvable } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { colors } from "../../../shared";
import { config_json_kxs_client } from "../../../kxs";

export const servers: command_type = {
    name: "servers",
    description: "Shows available servers to play with KxsClient",
    category: "🎮 Kxs",
    async function(client, message: Message) {
        // Load config.json about the url
        const config_from_json = await fetch(config_json_kxs_client, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const config = JSON.parse(await config_from_json.text());

        const embed = new EmbedBuilder()
            .setColor(colors.primary as ColorResolvable)
            .setAuthor({
                name: `${client.user?.username || 'Bot'} | Available servers`,
                iconURL: client.user?.displayAvatarURL() || ''
            })
            .setThumbnail(client.user?.displayAvatarURL() || null)
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL() || ''
            })
            .setDescription(`**Available servers**

»»——☠——« kxs.rip »——☠——««

> [KxsClient Website](https://kxs.rip)

»»——☠——« kxs.rip »——☠——««

${config.match.map((x: string) => `\`${x}\``).join('\n')}

`

            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
}