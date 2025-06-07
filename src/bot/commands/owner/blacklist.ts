import { EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { http_kxs_network_url } from "../../../kxs";
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

                const req = await fetch(`${http_kxs_network_url}/users-manager/blacklist`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ip,
                        reason: reason || "No reason provided",
                        adminKey: config.ADMIN_KEY
                    })
                });


                const data2 = await req.json() as any;

                if (!data2) {
                    return x.reply("Failed to blacklist ip (1)");
                }
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