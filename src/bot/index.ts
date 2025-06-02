import { Client, Collection } from "discord.js";
import { SteganoDB } from "stegano.db";
import cfg from "../../config.json";
import { Active_Intents } from "./funcs";
import { load_all } from "./load_all";

export const config = cfg;

export const bot = new Client({
    intents: [
        1048576, 2097152, 8192, 4096, 16384, 8, 16, 64, 2, 1024, 512, 2048, 4, 256, 65536,
        1, 128, 32, 32768, 16777216, 33554432
    ],
    allowedMentions: {
        repliedUser: false,
        roles: [],
        users: [],
        parse: []
    }
})

bot.commands = new Collection();

load_all()

export const db = new SteganoDB({
    driver: "json",
    filePath: process.cwd() + "/database.json",
    currentTable: "bot"
})

bot.login(config.DISCORD_TOKEN)
    .catch((err) => {
        let error = String(err);

        if (error.includes("Used disallowed intents")) {
            Active_Intents(config.DISCORD_TOKEN)
        };

        console.log(error)
        process.exit();
    })

process.on("SIGINT", async () => bot.destroy())