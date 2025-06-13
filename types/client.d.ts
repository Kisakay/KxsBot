import { Client, Collection } from "discord.js";
import type { command_type } from "./command_type";
import type { KxsDB } from "../src/db/module";

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, command_type>
        owners: string[]
        database: KxsDB;
        async prefix(guildId?: string): Promise<string>
    }
}