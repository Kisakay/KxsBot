import type { command_type } from "../../../../types/command_type";

export const invite: command_type = {
    name: "invite",
    description: "Invite the bot to your server",
    category: "🤖 Bot",
    options: [],
    async function(client, x) {
        x.reply(`> *<https://discord.com/oauth2/authorize?client_id=${client.user?.id}>*`)
    },
}