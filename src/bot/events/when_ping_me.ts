import type { event_type } from "../../../types/event_type";
import { timeouts } from "../../";

const sended_cooldown = new Set<string>();

function check_cooldown(user_id: string) {
    if (sended_cooldown.has(user_id)) {
        return true;
    }
    sended_cooldown.add(user_id);
    timeouts.push(setTimeout(() => sended_cooldown.delete(user_id), 60000));

    return false;
}

export const when_ping_me: event_type = {
    name: "messageCreate",
    once: false,
    async function(client, message) {
        if (message.content === `<@${client.user?.id}>` && !check_cooldown(message.author.id)) {
            message.reply(`Hey! I'm KxsBot, made by Anais! My prefix is **\`/\`**\n> Type \`/help\` to see my commands.`);
        }
    },
}