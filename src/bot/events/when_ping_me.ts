import type { event_type } from "../../../types/event_type";

const answered_pings: string[] = [];

function reset_answered_pings() {
    setTimeout(() => {
        answered_pings.splice(0, answered_pings.length);
    }, 15 * 60 * 1000);
}

export const when_ping_me: event_type = {
    name: "messageCreate",
    once: false,
    async function(client, message) {

        if (message.content === `<@${client.user?.id}>` && !answered_pings.includes(message.author.id)) {
            message.reply(`Hey! I'm KxsBot, made by Anais! My prefix is **\`${await client.prefix(message.guild?.id)}\`**\n> Type \`${await client.prefix(message.guild?.id)}help\` to see my commands.`);
            answered_pings.push(message.author.id);
        }
    },
}

reset_answered_pings();