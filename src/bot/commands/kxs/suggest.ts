import { PermissionFlagsBits, Message, ApplicationCommandOptionType } from "discord.js";
import type { command_type } from "../../../../types/command_type";
import { timeouts } from "../../..";

const sended_cooldown = new Set<string>();

function check_cooldown(user_id: string) {
    if (sended_cooldown.has(user_id)) {
        return true;
    }
    sended_cooldown.add(user_id);
    timeouts.push(setTimeout(() => sended_cooldown.delete(user_id), 60000));

    return false;
}

export const suggest: command_type = {
    name: "suggest",
    description: "Suggest a server to be added to the list",
    category: "🎮 Kxs",
    options: [
        {
            name: "suggestion",
            description: "the suggestion you want to send",
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    async function(client, message) {
        // check if the user has the required permissions
        if (!message.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
            message.reply("❌")
            return;
        }

        // if (!args[0]) {
        //     message.reply("> *Please specify a server name*")
        //     return;
        // }

        const server_name = message.options.getString('suggestion', true);

        // Check if the server is a working website
        const response = await fetch(server_name);
        const data = await response.text();
        if (!data) {
            message.reply("> *Server not found*")
            return;
        }

        if (check_cooldown(message.member.user.id)) {
            message.reply("> *You have already suggested a server recently*")
            return;
        }

        client.users.fetch(client.owners[0]).then(owner => {
            owner.send(`> *New server suggestion: ${server_name}*
> *Suggested by: ${message.user.tag} (${message.user.id})*`)
        })

        message.reply("> *Server suggested successfully*")
    },
}