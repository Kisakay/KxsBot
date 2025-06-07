import { EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { http_kxs_network_url } from "../../../kxs";
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

            const req = await fetch(`${http_kxs_network_url}/users-manager/unblacklist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ip,
                    adminKey: config.ADMIN_KEY
                })
            });

            const data2 = await req.json() as any;

            if (!data2) {
                return x.reply("Failed to unblacklist ip (1)");
            }

            const req1 = await fetch(`${http_kxs_network_url}/users-manager/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    adminKey: config.ADMIN_KEY
                })
            });

            const data = await req1.json() as any;

            let _blacklisted: {
                ip: string;
                reason: string;
            }[] = data?.blacklisted || [];

            if (!_blacklisted || !data || !data.blacklisted) {
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
            return x.reply("Failed to unblacklist ip (3)");
        }
    },
}