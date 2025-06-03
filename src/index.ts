process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import "./shared";
import "./db";
import "./bot";
import "./kxs"