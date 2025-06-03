import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";
import type { ColorResolvable } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { colors, config } from "../../../shared";

export const help: command_type = {
    name: "help",
    description: "Shows all available commands",
    category: "🤖 Bot",
    async function(client, message: Message) {
        // Get command categories
        const categories = new Map<string, command_type[]>();

        client.commands.forEach((cmd) => {
            // Use the category property if it exists, otherwise use "General"
            const category = (cmd as any).category || "General";

            if (!categories.has(category)) {
                categories.set(category, []);
            }

            categories.get(category)?.push(cmd);
        });

        // Create the main embed
        const main_embed = new EmbedBuilder()
            .setColor(colors.primary as ColorResolvable)
            .setAuthor({
                name: `${client.user?.username || 'Bot'} | Help and Commands`,
                iconURL: client.user?.displayAvatarURL() || ''
            })
            .setThumbnail(client.user?.displayAvatarURL() || null)
            .setDescription(`**Welcome to ${client.user?.username}'s help menu!**\n\nThis bot has ${client.commands.size} commands across ${categories.size} categories.\n\nUse the buttons below to navigate between different command categories.`)
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL() || ''
            })
            .setTimestamp();

        // Create buttons for each category
        const row = new ActionRowBuilder<ButtonBuilder>();

        // Limit to 5 buttons maximum (Discord limit)
        const category_names = Array.from(categories.keys()).slice(0, 5);

        category_names.forEach((category, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`help_category_${index}`)
                    .setLabel(category)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        // Send the initial message
        const help_message = await message.reply({
            embeds: [main_embed],
            components: category_names.length > 0 ? [row] : []
        });

        // Create collector for button interactions
        const collector = help_message.createMessageComponentCollector({
            time: 60000 // Collector expires after 60 seconds
        });

        collector.on('collect', async (interaction) => {
            if (!interaction.isButton()) return;
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({
                    content: "You cannot use these buttons as you are not the author of this command.",
                    ephemeral: true
                });
                return;
            }

            const parts = interaction.customId!.split('_');
            const category_index = parseInt(String(parts.length > 2 ? parts[2] : '0'));
            const category_name = category_names[category_index] || "General";
            const commands = categories.get(category_name) || [];

            // Create category embed
            const categoryEmbed = new EmbedBuilder()
                .setColor(colors.primary as ColorResolvable)
                .setAuthor({
                    name: `${client.user?.username || 'Bot'} | Category: ${category_name}`,
                    iconURL: client.user?.displayAvatarURL?.() || ''
                })
                .setThumbnail(client.user?.displayAvatarURL() || null)
                .setDescription(`Here are the available commands in the **${category_name}** category:`)
                .setFooter({
                    text: `Requested by ${message.author.tag} • Page ${category_index + 1}/${category_names.length}`,
                    iconURL: message.author.displayAvatarURL() || ''
                })
                .setTimestamp();

            // Add commands to the embed
            commands.forEach(cmd => {
                const usage = (cmd as any).usage ? `\n**Usage:** ${(cmd as any).usage}` : '';
                const aliases = (cmd as any).aliases ? `\n**Aliases:** ${(cmd as any).aliases.join(', ')}` : '';
                const cooldown = (cmd as any).cooldown ? `\n**Cooldown:** ${(cmd as any).cooldown} seconds` : '';

                categoryEmbed.addFields({
                    name: `\`${config.DEFAULT_BOT_PREFIX}${cmd.name}\``,
                    value: `${cmd.description}${usage}${aliases}${cooldown}`,
                    inline: false
                });
            });

            // Add a button to return to home
            const backRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('help_home')
                        .setLabel("Back to home")
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🏠')
                );

            // Add category buttons
            category_names.forEach((cat, idx) => {
                (row.components[idx] as ButtonBuilder).setStyle(
                    idx === category_index ? ButtonStyle.Success : ButtonStyle.Primary
                );
            });

            await interaction.update({
                embeds: [categoryEmbed],
                components: [row, backRow]
            });
        });

        // Handle back to home button
        collector.on('collect', async (interaction) => {
            if (!interaction.isButton() || interaction.customId !== 'help_home') return;
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({
                    content: "You cannot use these buttons as you are not the author of this command.",
                    ephemeral: true
                });
                return;
            }

            // Reset button styles
            category_names.forEach((_, idx) => {
                (row.components[idx] as ButtonBuilder).setStyle(ButtonStyle.Primary);
            });

            await interaction.update({
                embeds: [main_embed],
                components: [row]
            });
        });

        // When the collector expires
        collector.on('end', () => {
            // Disable all buttons
            row.components.forEach(button => (button as ButtonBuilder).setDisabled(true));

            help_message.edit({
                components: []
            }).catch(() => { });
        });
    },
}