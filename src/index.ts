process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

export const intervals: NodeJS.Timeout[] = [];
export const timeouts: NodeJS.Timeout[] = [];

import "./shared";
import "./db";

import { bot } from "./bot";
import { kxsNetwork } from "./kxs";

process.on("SIGINT", async () => {    
    // Clean up all intervals
    intervals.forEach(interval => clearInterval(interval));
    timeouts.forEach(timeout => clearTimeout(timeout));
    
    // Remove all listeners from kxsNetwork
    kxsNetwork.removeAllListeners();
    
    // Disconnect from kxsNetwork
    kxsNetwork.disconnect();
    
    // Destroy the bot client
    await bot.destroy();
    
    console.log('Cleanup complete, exiting.');
    
    // Exit with success code
    process.exit(0);
})