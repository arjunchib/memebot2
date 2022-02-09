import { Client, Intents } from "discord.js";
import { Sequelize } from "sequelize";
import { token, primaryGuildId } from "../config.js";
import * as commands from "./commands";
import { Umzug, SequelizeStorage } from "umzug";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "memebot.sqlite",
});

const umzug = new Umzug({
  migrations: { glob: "migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Checks migrations and run them if they are not already applied. To keep
// track of the executed migrations, a table (and sequelize model) called SequelizeMeta
// will be automatically created (if it doesn't exist already) and parsed.
await umzug.up();

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
