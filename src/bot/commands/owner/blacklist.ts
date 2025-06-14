import { EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { kxsNetwork } from "../../../kxs";
import { config } from "../../../shared";

export const blacklist: command_type = {
    name: "blacklist",
    description: "Blacklist a ip address in the KxsNetwork",
    category: "🌟 Owner",
    async function(client, x: Message, args) {
        if (!client.owners.includes(x.author.id)) {
            return x.react("❌")
        };

        let embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Blacklist")
            ;

        try {
            let ip = args[0];
            let reason = args.slice(1).join(" ");

            if (ip) {
                const data2 = await kxsNetwork.blacklistIp(config.ADMIN_KEY, ip, reason)

                if (!data2) {
                    return x.reply("Failed to blacklist ip (1)");
                }
            }

            const data = await kxsNetwork.getServerStatus(config.ADMIN_KEY)

            if (!data) {
                return x.reply("Failed to get blacklist (2)");
            }

            let _blacklisted: {
                ip: string;
                reason: string;
            }[] = data?.blacklisted || [];

            if (!_blacklisted || _blacklisted.length === 0 || !data || !data.blacklisted) {
                return x.reply("Failed to get blacklist (2)");
            }

            let blacklisted = "List: \n";

            _blacklisted.forEach((x: any) => {
                blacklisted += `\`${x.ip}\`\n- ${x.reason}\n`
            });

            embed.setDescription(blacklisted);

            x.reply({ embeds: [embed] });
        } catch (err) {
            console.log(err);
            return x.reply("Failed to blacklist ip (3)");
        }
    },
}