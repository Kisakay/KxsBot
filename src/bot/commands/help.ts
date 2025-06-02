import { EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../types/command_type";

export const help: command_type = {
    name: "help",
    description: "Show all command in the bot",
    function(client, x: Message) {
        let h = '';
        client.commands.forEach((x) => {
            h += `- ${x.name}\n${x.description}`
        })

        let embed = new EmbedBuilder()
            .setDescription(
                h
            )

        x.reply({ embeds: [embed] })
    },
}