import { EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../types/command_type";

export const owner: command_type = {
    name: "owner",
    description: "Show all bot owner(s)",
    category: "🌟 Owner",
    async function(client, x: Message) {
        if (!client.owners.includes(x.author.id)) {
            return x.react("❌")
        };

        let embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Owner(s)")
            ;

        let owners = "";

        client.owners.forEach(x => {
            owners += `<@${x}>\n`
        });

        embed.setDescription(owners);

        x.reply({ embeds: [embed] });
    },
}