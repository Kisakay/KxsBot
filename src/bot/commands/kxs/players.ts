import { EmbedBuilder, Message } from "discord.js";
import type { ColorResolvable } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { colors } from "../../../shared";
import { kxsNetwork } from "../../../kxs";

export const players: command_type = {
    name: "players",
    description: "Shows players online",
    category: "🤖 Bot",
    async function(client, message: Message) {
        const embed = new EmbedBuilder()
            .setColor(colors.primary as ColorResolvable)
            .setAuthor({
                name: `${client.user?.username || 'Bot'} | Players Online`,
                iconURL: client.user?.displayAvatarURL() || ''
            })
            .setThumbnail(client.user?.displayAvatarURL() || null)
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL() || ''
            })
            .setDescription(`**Players Online**

»»——☠——« kxs.rip »——☠——««

**Players:** ${kxsNetwork.getKxsUsers().map(x => `\`${x}\``).join(', ')}

»»——☠——« kxs.rip »——☠——««

> [KxsClient Website](https://kxs.rip)
> [KxsClient GitHub](https://github.com/AnaisSaraiva/KxsClient)
> [KxsClient Discord](https://discord.gg/kxsclient)
`

            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
}