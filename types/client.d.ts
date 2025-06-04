import { Client, Collection } from "discord.js";
import type { command_type } from "./command_type";
import type { BunDB } from "bun.db";

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, command_type>
        owners: string[]
        database: BunDB;
        async prefix(guildId?: string): Promise<string>
    }
}