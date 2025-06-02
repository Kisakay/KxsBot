import { bot } from ".";

import { new_message } from "../events/on_message";
import { ready } from "../events/on_ready";

export function load_all() {
    load_events()
}

function load_events() {
    let _ = Object.values([
        ready,
        new_message
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