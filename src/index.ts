process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import "./bot";
import "./shared";
import "./db";
import "./kxs"