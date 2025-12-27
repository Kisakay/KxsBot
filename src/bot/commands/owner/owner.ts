import { EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";

export const owner: command_type = {
    name: "owner",
    description: "Show all bot owner(s)",
    category: "🌟 Owner",
    options: [],

    async function(client, x) {
        if (!client.owners.includes(x.member.user.id)) {
            return x.reply("> *You are not owner of the bot*")
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