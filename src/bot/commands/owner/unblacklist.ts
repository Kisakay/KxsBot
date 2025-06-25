import { EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { kxsNetwork } from "../../../kxs";
import { config } from "../../../shared";

export const unblacklist: command_type = {
    name: "unblacklist",
    description: "Unblacklist a ip address in the KxsNetwork",
    category: "🌟 Owner",
    async function(client, x: Message, args) {
        if (!client.owners.includes(x.author.id)) {
            return x.react("❌")
        };

        let embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Blacklist")
            ;

        let ip = args[0];

        if (!ip) return x.reply("Please specify an ip address");

        try {
            if (ip) {
                const data2 = await kxsNetwork.unblacklistIp(config.ADMIN_KEY, ip);

                if (!data2) {
                    return x.reply("Failed to unblacklist ip (1)");
                }
            }

            const data = await kxsNetwork.getServerStatus(config.ADMIN_KEY);

            let blacklisted_ips = data?.blacklisted || [];

            if (!blacklisted_ips || !data || !data.blacklisted) {
                return x.reply("Failed to get blacklist (2)");
            }

            await x.reply({
                content: "ip is now unblacklisted"
            });

        } catch (err) {
            console.log(err);
            return x.reply("Failed to unblacklist ip (3)");
        }
    },
}