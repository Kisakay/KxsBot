import { Message } from "discord.js";
import type { event_type } from "../../types/event_type";

export const new_message: event_type = {
    name: "messageCreate",
    once: false,
    function(client, x: Message) {
        console.log(x.content)
    },
}