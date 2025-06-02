import { Client, Collection } from "discord.js";
import type { command_type } from "./command_type";

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, command_type>
    }
}