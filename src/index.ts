import {
  Client,
  GatewayIntentBits,
  Message,
  PermissionFlagsBits,
  OAuth2Scopes,
  InteractionType,
  Interaction,
} from "discord.js";
import { token, primaryGuildId } from "../config.js";
import * as commands from "./commands";
import fs from "fs-extra";
import { CommandError } from "./util.js";

await Promise.all([fs.emptyDir(".temp"), fs.ensureDir("audio")]);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
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
      permissions: [PermissionFlagsBits.Administrator],
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
    })
  );
  const primaryGuild = await client.guilds.fetch(primaryGuildId);
  await primaryGuild.commands.set(commandData);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (
      interaction.type === InteractionType.ApplicationCommand ||
      interaction.isAutocomplete()
    ) {
      await runners[interaction.commandName](interaction);
    } else if (interaction.isMessageComponent()) {
      if (interaction.message instanceof Message) {
        await runners[interaction.message.interaction.commandName](interaction);
      }
    }
  } catch (e) {
    if (
      interaction.type === InteractionType.ApplicationCommand ||
      interaction.isMessageComponent()
    ) {
      if (e instanceof CommandError) {
        await replyError(interaction, e.message);
      } else {
        await replyError(interaction, "Something went wrong!", false);
        console.error(e);
      }
    } else {
      console.error(e);
    }
  }
});

async function replyError(
  interaction: Interaction,
  content: string,
  log = true
) {
  if (
    interaction.type !== InteractionType.ApplicationCommand &&
    !interaction.isMessageComponent()
  )
    return;
  if (!interaction.isRepliable()) {
    return console.error(content);
  }
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: content });
  } else {
    await interaction.reply({ content: content, ephemeral: true });
  }
}

client.login(token);

process.on("SIGINT", async () => {
  await cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(0);
});

async function cleanup() {
  if (process.env.NODE_ENV !== "production" && client.isReady()) {
    const primaryGuild = await client.guilds.fetch(primaryGuildId);
    await primaryGuild.commands.set([]);
  }
}
