import { SteganoDB } from "stegano.db";

export const db = new SteganoDB({
    driver: "json",
    filePath: process.cwd() + "/database.json",
    currentTable: "bot"
})

console.log(
    `Database is running`
)