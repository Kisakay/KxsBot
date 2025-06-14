import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { http_kxs_network_url, kxsNetwork } from "../../../kxs";
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

            // Pagination setup
            const items_per_page = 5;
            const total_pages = Math.ceil(blacklisted_ips.length / items_per_page);
            let current_page = 0;

            // Function to generate embed for a specific page
            const generate_page_embed = (page_number: number) => {
                const start_index = page_number * items_per_page;
                const end_index = Math.min(start_index + items_per_page, blacklisted_ips.length);
                const page_items = blacklisted_ips.slice(start_index, end_index);

                let page_content = "";
                page_items.forEach((item) => {
                    page_content += `\`${item.ip}\`\n- ${item.reason}\n`;
                });

                return new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Blacklist")
                    .setDescription(page_content || "No blacklisted IPs found.")
                    .setFooter({
                        text: `Page ${page_number + 1}/${total_pages || 1} • Total: ${blacklisted_ips.length} blacklisted IPs`
                    })
                    .setTimestamp();
            };

            // Create navigation buttons
            const create_buttons = (page_number: number) => {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("first_page")
                            .setLabel("⏪ First")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page_number === 0),
                        new ButtonBuilder()
                            .setCustomId("previous_page")
                            .setLabel("◀️ Previous")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page_number === 0),
                        new ButtonBuilder()
                            .setCustomId("next_page")
                            .setLabel("Next ▶️")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page_number === total_pages - 1 || total_pages === 0),
                        new ButtonBuilder()
                            .setCustomId("last_page")
                            .setLabel("Last ⏩")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page_number === total_pages - 1 || total_pages === 0)
                    );
                return row;
            };

            // Send initial message with first page
            const initial_embed = generate_page_embed(current_page);
            const initial_buttons = create_buttons(current_page);

            const message = await x.reply({
                embeds: [initial_embed],
                components: total_pages > 1 ? [initial_buttons] : []
            });

            // Only create collector if there are multiple pages
            if (total_pages > 1) {
                // Create collector for button interactions
                const collector = message.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 60000 // Collector expires after 60 seconds
                });

                collector.on("collect", async (interaction) => {
                    // Ensure only the command author can use the buttons
                    if (interaction.user.id !== x.author.id) {
                        await interaction.reply({
                            content: "You cannot use these buttons as you are not the author of this command.",
                            ephemeral: true
                        });
                        return;
                    }

                    // Handle button interactions
                    switch (interaction.customId) {
                        case "first_page":
                            current_page = 0;
                            break;
                        case "previous_page":
                            current_page = Math.max(0, current_page - 1);
                            break;
                        case "next_page":
                            current_page = Math.min(total_pages - 1, current_page + 1);
                            break;
                        case "last_page":
                            current_page = total_pages - 1;
                            break;
                    }

                    // Update message with new page
                    const updated_embed = generate_page_embed(current_page);
                    const updated_buttons = create_buttons(current_page);

                    await interaction.update({
                        embeds: [updated_embed],
                        components: [updated_buttons]
                    });
                });

                // When the collector expires
                collector.on("end", () => {
                    // Remove all buttons when the collector expires
                    message.edit({
                        components: []
                    }).catch(() => { });
                });
            }
        } catch (err) {
            console.log(err);
            return x.reply("Failed to unblacklist ip (3)");
        }
    },
}