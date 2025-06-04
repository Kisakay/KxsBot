import { BunDB } from "bun.db"

export const db = new BunDB(process.cwd() + "/database.sqlite")

console.log(
    `Database is running`
)