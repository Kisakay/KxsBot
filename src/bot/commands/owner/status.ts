import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { http_kxs_network_url } from "../../../kxs";
import { config } from "../../../shared";

export const status: command_type = {
    name: "status",
    description: "Get the status of the KxsNetwork",
    category: "🌟 Owner",
    async function(client, x: Message, args) {
        if (!client.owners.includes(x.author.id)) {
            return x.react("❌")
        };

        try {
            // Display a loading message
            const loading_message = await x.reply("📊 Fetching network status...");

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

            let _players: {
                username: string;
                ip: string;
                id: string;
                isVoiceChat: boolean;
                gameId?: string;
                version: string;
            }[] = data?.players || [];

            if (!_players || _players.length === 0 || !data || !data.players) {
                return loading_message.edit("❌ Failed to get players data");
            }

            // Pagination setup
            const players_per_page = 5;
            const total_pages = Math.ceil(_players.length / players_per_page);
            let current_page = 0;

            // Function to generate embed for a specific page
            const generate_page_embed = (page_number: number) => {
                const start_index = page_number * players_per_page;
                const end_index = Math.min(start_index + players_per_page, _players.length);
                const page_players = _players.slice(start_index, end_index);

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("📡 KxsNetwork Status")
                    .setFooter({ text: `Page ${page_number + 1}/${total_pages} • Total Players: ${_players.length}` })
                    .setTimestamp();

                let players_text = "";

                page_players.forEach((player, index) => {
                    const player_number = start_index + index + 1;
                    const game_status = player.gameId ? `🎮 ${player.gameId}` : "🔍 No game";
                    const voice_status = player.isVoiceChat ? "🎤 Voice: On" : "🔇 Voice: Off";

                    players_text += `**${player_number}. ${player.username}** 👤\n` +
                        `└ 🌐 \`${player.ip}\`\n` +
                        `└ 🆔 \`${player.id}\`\n` +
                        `└ ${voice_status}\n` +
                        `└ ${game_status}\n` +
                        `└ \`${player.version}\`\n\n`;
                });

                embed.setDescription(players_text || "No players found");
                return embed;
            };

            // Create navigation buttons
            const create_buttons = (disabled_prev: boolean, disabled_next: boolean) => {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("first")
                            .setLabel("⏮️ First")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(disabled_prev),
                        new ButtonBuilder()
                            .setCustomId("prev")
                            .setLabel("◀️ Previous")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(disabled_prev),
                        new ButtonBuilder()
                            .setCustomId("next")
                            .setLabel("Next ▶️")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(disabled_next),
                        new ButtonBuilder()
                            .setCustomId("last")
                            .setLabel("Last ⏭️")
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(disabled_next)
                    );
                return row;
            };

            // Initial embed and buttons
            const initial_embed = generate_page_embed(current_page);
            const initial_buttons = create_buttons(true, total_pages <= 1);

            // Edit the loading message with our paginated content
            const message = await loading_message.edit({
                content: "",
                embeds: [initial_embed],
                components: [initial_buttons]
            });

            // Create collector for button interactions
            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 5 * 60 * 1000 // 5 minutes timeout
            });

            collector.on("collect", async (interaction) => {
                // Only allow the command author to use the buttons
                if (interaction.user.id !== x.author.id) {
                    return interaction.reply({
                        content: "❌ These buttons are not for you!",
                        ephemeral: true
                    });
                }

                // Handle button actions
                switch (interaction.customId) {
                    case "first":
                        current_page = 0;
                        break;
                    case "prev":
                        current_page = Math.max(0, current_page - 1);
                        break;
                    case "next":
                        current_page = Math.min(total_pages - 1, current_page + 1);
                        break;
                    case "last":
                        current_page = total_pages - 1;
                        break;
                }

                // Update embed and buttons
                const updated_embed = generate_page_embed(current_page);
                const updated_buttons = create_buttons(
                    current_page === 0,
                    current_page === total_pages - 1
                );

                await interaction.update({
                    embeds: [updated_embed],
                    components: [updated_buttons]
                });
            });

            collector.on("end", async () => {
                // Remove buttons when collector expires
                try {
                    await message.edit({
                        components: []
                    });
                } catch (err) {
                    console.log("Failed to remove buttons: ", err);
                }
            });

        } catch (err) {
            console.log(err);
            return x.reply("❌ Failed to get status (3)");
        }
    },
}