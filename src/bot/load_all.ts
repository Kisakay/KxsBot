import { bot } from ".";
import { botinfo } from "./commands/bot/botinfo";
import { help } from "./commands/bot/help";
import { owner } from "./commands/owner/owner";
import { players } from "./commands/kxs/players";
import { new_message } from "./events/on_interaction";
import { ready } from "./events/on_ready";
import { counters } from "./commands/kxs/counters";
import { servers } from "./commands/kxs/servers";
import { suggest } from "./commands/kxs/suggest";
import { when_ping_me } from "./events/when_ping_me";
import { invite } from "./commands/bot/invite";
import { blacklist } from "./commands/owner/blacklist";
import { unblacklist } from "./commands/owner/unblacklist";
import { status } from "./commands/owner/status";
import { ApplicationCommand, REST, Routes } from "discord.js";
import { config } from "../shared";
import { getUserIdFromToken } from "./funcs";

const rest = new REST();

export function load_all() {
    load_events()
    load_commands()
}

function load_events() {
    let _ = Object.values([
        ready,
        new_message,
        when_ping_me
    ])

    for (let event of _) {
        if (event.once) {
            bot.once(event.name, event.function.bind(null, bot));
            console.log("[Event: Once] " + event.name);
        } else {
            bot.on(event.name, event.function.bind(null, bot));
            console.log("[Event] " + event.name);
        }
    }
}

async function load_commands() {
    let _ = Object.values([
        help,
        owner,
        botinfo,
        players,
        counters,
        servers,
        suggest,
        invite,
        blacklist,
        unblacklist,
        status
    ])

    for (let command of _) {
        bot.commands.set(command.name, command)
        console.log("[Command] " + command.name);
    }

    rest.setToken(config.DISCORD_TOKEN);

    const data = await rest.put(Routes.applicationCommands(getUserIdFromToken(config.DISCORD_TOKEN)), {
        body: _.map(x => {
            return {
                name: x.name,
                description: x.description,
                options: x.options || []
            }
        })
    });

    console.log(`Currently, ${(data as unknown as ApplicationCommand[]).length} applications are now synchronized.`);
}