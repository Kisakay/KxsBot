import { Message, PermissionFlagsBits, ChannelType, ApplicationCommandOptionType } from "discord.js";
import type { command_type } from "../../../../types/command_type";

export const counters: command_type = {
    name: "counters",
    description: "Make a voice channel counter with the number of kxs users online \`{online} variable\`",
    category: "🎮 Kxs",
    options: [
        {
            description: "the voice channel",
            name: "voice_channel",
            required: true,
            type: ApplicationCommandOptionType.Channel
        },
        {
            description: "channel name with {Online} variable",
            name: "channel_name",
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    async function(client, message) {
        // Check if the user has the required permissions
        if (!message.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
            message.reply("❌")
            return;
        }

        // // Get the voice channel on the args
        // if (!args[0]) {
        //     message.reply("Please specify a voice channel")
        //     return;
        // }

        // // Get the channel name
        // if (!args[1]) {
        //     message.reply("Please specify a channel name")
        //     return;
        // }

        const voice_channel = message.options.getChannel("voice_channel", true);
        const channel_name = message.options.getString("channel_name", true);

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