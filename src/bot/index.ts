import { Client } from "discord.js";
import { SteganoDB } from "stegano.db";

export const bot = new Client({
    intents: [32767],
    allowedMentions: {
        repliedUser: false,
        roles: [],
        users: [],
        parse: []
    }
})

export const db = new SteganoDB({
    driver: "json",
    filePath: process.cwd() + "/database.json",
    currentTable: "bot"
})

bot.login()