import type { Client, Message } from "discord.js";

interface command_type {
    name: string;
    description: string;

    async function(client: Client, x: Message);
}