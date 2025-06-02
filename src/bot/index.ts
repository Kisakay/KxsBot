import { Client, Collection } from "discord.js";
import { Active_Intents } from "./funcs";
import { load_all } from "./load_all";
import { config } from "../shared";

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