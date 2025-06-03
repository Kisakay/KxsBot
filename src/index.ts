process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

export const intervals: NodeJS.Timeout[] = [];

import "./bot";
import "./shared";
import "./db";
import "./kxs"

import { bot } from "./bot";
import { kxsNetwork } from "./kxs";

process.on("SIGINT", async () => {
    bot.destroy()
    kxsNetwork.disconnect(true)
    intervals.forEach(interval => clearInterval(interval))
})