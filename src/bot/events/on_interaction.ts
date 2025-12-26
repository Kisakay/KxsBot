import { ChatInputCommandInteraction, type Interaction, PermissionFlagsBits } from "discord.js";
import type { event_type } from "../../../types/event_type";
import { config } from "../../shared";

export const new_message: event_type = {
    name: "interactionCreate",
    once: false,
    async function(client, x: Interaction) {
        // if ()
        if (!x.isCommand()
            || !x.guild?.channels
            || x.user.bot) return;

        if (!x.guild?.members.me?.permissions.has(PermissionFlagsBits.Administrator)) return;
        let cmd = client.commands.get(x.commandName);

        if (!cmd) return;

        cmd.function(client, x as ChatInputCommandInteraction);
    },
}