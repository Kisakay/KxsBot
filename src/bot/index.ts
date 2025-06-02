import { Client } from "discord.js";
import { SteganoDB } from "stegano.db";
import config from "../../config.json";
import { Active_Intents } from "./funcs";
import { load_all } from "./load_all";

export const bot = new Client({
    intents: [32767],
    allowedMentions: {
        repliedUser: false,
        roles: [],
        users: [],
        parse: []
    }
})

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