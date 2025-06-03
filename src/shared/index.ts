import type { ColorResolvable } from "discord.js";
import cfg from "../../config.json";

export const config = cfg;

export const colors: Record<string, ColorResolvable> = {
    primary: "#5865F2",
    success: "#57F287",
    error: "#ED4245",
    warning: "#FEE75C",
    info: "#5865F2"
};
