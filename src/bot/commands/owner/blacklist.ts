import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message, time } from "discord.js";
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

        try {
            let ip = args[0];
            let reason = args.slice(1).join(" ");

            if (ip) {
                const data2 = await kxsNetwork.blacklistIp(config.ADMIN_KEY, ip, reason)

                if (!data2) {
                    return x.reply("❌ **Error** - Failed to blacklist IP address. Please verify the IP is valid.");
                }
            }

            const data = await kxsNetwork.getServerStatus(config.ADMIN_KEY)

            if (!data) {
                return x.reply("❌ **Error** - Failed to retrieve server blacklist.");
            }

            let blacklisted_ips = data?.blacklisted || [];

            if (!blacklisted_ips || blacklisted_ips.length === 0 || !data || !data.blacklisted) {
                return x.reply("📋 **Information** - No IP addresses are currently blacklisted.");
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

                const embed = new EmbedBuilder()
                    .setColor(0xFF4444) // Red to indicate danger/blacklist
                    .setTitle("🚫 KxsNetwork Blacklist")
                    .setDescription("📋 **Blacklisted IP addresses on the network**\n\n" + 
                        (page_items.length === 0 ? "*No blacklisted IPs found.*" : ""))
                    .setFooter({
                        text: `📄 Page ${page_number + 1}/${total_pages} • 🔢 Total: ${blacklisted_ips.length} blacklisted IP(s)`,
                        iconURL: client.user?.displayAvatarURL()
                    })
                    .setTimestamp()
                    .setThumbnail("https://cdn.discordapp.com/emojis/1234567890123456789.png"); // Optional: security icon

                // Add each IP as a separate field for better readability
                page_items.forEach((item, index) => {
                    const fieldIndex = start_index + index + 1;
                    embed.addFields({
                        name: `🔒 IP #${fieldIndex}: \`${item.ip}\``,
                        value: `**📝 Reason:** ${item.reason || "*No reason specified*"}\n` +
                               `**👤 IGN:** ${item.ign || "*Unknown*"}\n` +
                               `**⏰ Blacklisted:** ${time(new Date(item.timestamp), 'R')}`,
                        inline: false
                    });
                });

                return embed;
            };

            // Create navigation buttons
            const create_buttons = (page_number: number) => {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("first_page")
                            .setLabel("⏪ First")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page_number === 0),
                        new ButtonBuilder()
                            .setCustomId("previous_page")
                            .setLabel("◀️ Previous")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page_number === 0),
                        new ButtonBuilder()
                            .setCustomId("next_page")
                            .setLabel("Next ▶️")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page_number === total_pages - 1),
                        new ButtonBuilder()
                            .setCustomId("last_page")
                            .setLabel("Last ⏩")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page_number === total_pages - 1)
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
                            content: "❌ **Access Denied** - You cannot use these buttons as you are not the author of this command.",
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
            return x.reply("❌ **Critical Error** - An unexpected error occurred while executing the command.");
        }
    },
}