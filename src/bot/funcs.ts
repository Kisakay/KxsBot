export async function Active_Intents(x: string) {
    try {
        const response = await fetch("https://discord.com/api/v10/applications/@me", {
            "method": "PATCH",
            "headers": {
                "Authorization": "Bot " + x,
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({ flags: 565248 }),
        });
        return await response.json();

    } catch (err) {
        throw err;
    }
};