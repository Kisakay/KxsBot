import { EmbedBuilder, Message } from "discord.js";
import type { ColorResolvable } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { colors, config } from "../../../shared";

export const botinfo: command_type = {
    name: "botinfo",
    description: "Shows bot information",
    category: "🤖 Bot",
    async function(client, message: Message) {
        const embed = new EmbedBuilder()
            .setColor(colors.primary as ColorResolvable)
            .setAuthor({
                name: `${client.user?.username || 'Bot'} | Bot Information`,
                iconURL: client.user?.displayAvatarURL() || ''
            })
            .setThumbnail(client.user?.displayAvatarURL() || null)
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL() || ''
            })
            .setDescription(`**Bot Information**\n\n`
                +
                `»»——☠——« kxs.rip »——☠——««\n`
                +
                `**Owner:** ${client.owners.map(x => `<@${x}>`).join(', ')}\n` +
                `**Prefix:** ${config.DEFAULT_BOT_PREFIX}\n` +
                `**Commands:** ${client.commands.size}\n` +
                `**Servers:** ${client.guilds.cache.size}\n` +
                `**Users:** ${client.users.cache.size}\n` +
                `**Memory Usage:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB\n` +
                `**Uptime:** ${Math.round(process.uptime())} seconds\n` +
                `**Version:** ${process.version}\n` +
                `**Bot Latency:** ${client.ws.ping} ms\n`
                +
                `»»——☠——« kxs.rip »——☠——««\n`
                +
                `> [KxsClient Website](https://kxs.rip)\n`
                +
                `> [KxsClient GitHub](https://github.com/AnaisSaraiva/KxsClient)\n`
                +
                `> [KxsClient Discord](https://discord.gg/kxsclient)\n`
                
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
}