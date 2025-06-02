import type { Client } from "discord.js";

interface event_type {
    once: boolean;
    name: string;
    async function(client: Client, x: any, y: any, z: any);
}