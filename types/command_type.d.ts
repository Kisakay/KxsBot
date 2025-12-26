import type { ChatInputCommandInteraction, Client, Interaction, Message,ApplicationCommandOptionType } from "discord.js";

interface command_type {
    name: string;
    description: string;

    category: string;

    options: options[];

    async function(client: Client, x: ChatInputCommandInteraction);
}

export interface options {
	type: ApplicationCommandOptionType,
	name: string,
	description: string,
	required: boolean,
}
