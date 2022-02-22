import { Client, Intents, Message, MessageAttachment } from "discord.js";
import { token, primaryGuildId } from "../config.js";
import * as commands from "./commands";
import fs from "fs-extra";

await Promise.all([fs.emptyDir(".temp"), fs.ensureDir("audio")]);

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
  console.log(
    client.generateInvite({
      permissions: ["ADMINISTRATOR"],
      scopes: ["bot", "applications.commands"],
    })
  );
  const primaryGuild = await client.guilds.fetch(primaryGuildId);
  primaryGuild.commands.set(commandData);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isApplicationCommand() || interaction.isAutocomplete()) {
      await runners[interaction.commandName](interaction);
    } else if (interaction.isMessageComponent()) {
      if (interaction.message instanceof Message) {
        await runners[interaction.message.interaction.commandName](interaction);
      }
    }
  } catch (e) {
    console.error(e);
  }
});

client.login(token);
