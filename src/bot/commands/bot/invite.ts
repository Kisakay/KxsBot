import { Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";

export const invite: command_type = {
    name: "invite",
    description: "Invite the bot to your server",
    category: "🤖 Bot",
    async function(client, x: Message) {
        x.reply(`> *<https://discord.com/oauth2/authorize?client_id=${client.user?.id}>*`)
    },
}