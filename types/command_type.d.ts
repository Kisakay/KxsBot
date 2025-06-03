import type { Client, Message } from "discord.js";

interface command_type {
    name: string;
    description: string;

    category: string;

    async function(client: Client, x: Message, args?: string[]);
}