import { ChannelType, Message, PermissionFlagsBits } from "discord.js";
import type { event_type } from "../../types/event_type";
import { config } from "../bot";

export const new_message: event_type = {
    name: "messageCreate",
    once: false,
    function(client, x: Message) {
        if (!x.content.startsWith(config.DEFAULT_BOT_PREFIX)) { return; }
        if (x.channel.type !== ChannelType.GuildText) return;

        if (!x.guild?.members.me?.permissions.has(PermissionFlagsBits.Administrator)) return;

        let args = x.content.slice(config.DEFAULT_BOT_PREFIX.length).trim().split(/ +/g);
        let cmd = client.commands.get(args.shift() || "");

        if (!cmd) return;

        cmd.function(client, x);
    },
}