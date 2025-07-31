import { Message, PermissionFlagsBits, ChannelType } from "discord.js";
import type { command_type } from "../../../../types/command_type";

export const counters: command_type = {
    name: "counters",
    description: "Make a voice channel counter with the number of kxs users online \`{online} variable\`",
    category: "🎮 Kxs",
    async function(client, message: Message, args: string[]) {
        // Check if the user has the required permissions
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            message.react("❌")
            return;
        }

        // Get the voice channel on the args
        if (!args[0]) {
            message.reply("Please specify a voice channel")
            return;
        }

        // Get the channel name
        if (!args[1]) {
            message.reply("Please specify a channel name")
            return;
        }

        const voice_channel = message.guild?.channels.cache.get(args[0]) || message.mentions.channels.first();
        const channel_name = args.slice(1).join(" ");

        if (!voice_channel || voice_channel.type !== ChannelType.GuildVoice) {
            message.reply("Please specify a valid voice channel")
            return;
        }

        let guild = await client.database.table("guilds");

        await guild.set(`${message.guild?.id}.online_counter`, {
            channel: voice_channel.id,
            name: channel_name
        });

        message.reply("> *Counter created successfully, the counter will be updated every 15 minutes.*")
    },
}