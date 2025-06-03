import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Active_Intents } from "./funcs";
import { load_all } from "./load_all";
import { config } from "../shared";
import { db } from "../db";

export const bot = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.Guilds
    ],
    allowedMentions: {
        repliedUser: false,
        roles: [],
        users: [],
        parse: []
    }
})

bot.owners = [];
bot.database = db;
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