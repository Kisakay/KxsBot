import { PallasDB } from "pallas-db"

export const db = new PallasDB({
    dialect: "sqlite",
    tables: ["bot", "owners", "guilds", "temp", 'config'],
    storage: process.cwd() + "/database.sqlite"
})

console.log(
    `Database is running`
)