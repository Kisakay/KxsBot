import { PermissionFlagsBits, Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";

export const prefix: command_type = {
    name: "prefix",
    description: "Changes the bot's prefix",
    category: "🤖 Bot",
    async function(client, message: Message, args: string[]) {
        // check if the user has the required permissions
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            message.react("❌")
            return;
        }

        if (!args[0]) {
            message.reply("Please specify a prefix")
            return;
        }

        const prefix = args[0];

        if (prefix.length > 5) {
            message.reply("Prefix must be 5 characters or less")
            return;
        }

        const guild = await client.database.table("guilds");

        await guild.set(`${message.guild?.id}.prefix`, prefix);

        message.reply("> Prefix changed successfully. Now the prefix is \`" + prefix + "\`")
    },
}