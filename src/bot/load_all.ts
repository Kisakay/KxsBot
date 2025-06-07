import { bot } from ".";
import { botinfo } from "./commands/bot/botinfo";
import { help } from "./commands/bot/help";
import { owner } from "./commands/owner/owner";
import { players } from "./commands/kxs/players";
import { new_message } from "./events/on_message";
import { ready } from "./events/on_ready";
import { counters } from "./commands/kxs/counters";
import { prefix } from "./commands/bot/prefix";
import { servers } from "./commands/kxs/servers";
import { suggest } from "./commands/kxs/suggest";
import { when_ping_me } from "./events/when_ping_me";
import { invite } from "./commands/bot/invite";
import { blacklist } from "./commands/owner/blacklist";
import { unblacklist } from "./commands/owner/unblacklist";
import { status } from "./commands/owner/status";

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

function load_commands() {
    let _ = Object.values([
        help,
        owner,
        botinfo,
        players,
        counters,
        prefix,
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
}