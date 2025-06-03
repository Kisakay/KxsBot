import { ChannelType, Message, PermissionFlagsBits } from "discord.js";
import type { event_type } from "../../../types/event_type";
import { config } from "../../shared";

export const new_message: event_type = {
    name: "messageCreate",
    once: false,
    async function(client, x: Message) {
        if (!x.content.startsWith(await client.prefix(x.guild?.id))) { return; }
        if (x.channel.type !== ChannelType.GuildText) return;

        if (!x.guild?.members.me?.permissions.has(PermissionFlagsBits.Administrator)) return;

        let args = x.content.slice((await client.prefix(x.guild?.id)).length).trim().split(/ +/g);
        let cmd = client.commands.get(args.shift() || "");

        if (!cmd) return;

        cmd.function(client, x, args);
    },
}