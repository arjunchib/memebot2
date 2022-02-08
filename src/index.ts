import { Client, Intents } from "discord.js";
import { token, primaryGuildId } from "../config.js";
import * as commands from "./commands";

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
});

const commandData = Object.values(commands).map((mod) => mod.command);
const runners = Object.values(commands).reduce((acc, mod) => {
  acc[mod.command.name] = mod.run;
  return acc;
}, {});

client.once("ready", async () => {
  console.log("Ready!");
  const primaryGuild = await client.guilds.fetch(primaryGuildId);
  primaryGuild.commands.set(commandData);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isApplicationCommand()) {
    await runners[interaction.commandName](interaction);
  }
});

client.login(token);
