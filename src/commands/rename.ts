import {
  ApplicationCommandData,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { autocompleteCommands } from "../autocomplete";
import { CommandError } from "../util";

export const command: ApplicationCommandData = {
  name: "rename",
  description: "Change the display name",
  options: [
    {
      name: "meme",
      description: "Name",
      type: 3,
      required: true,
      autocomplete: true,
    },
    {
      name: "name",
      description: "New display name",
      type: 3,
      required: true,
    },
  ],
};

export async function run(interaction: Interaction) {
  if (interaction.isCommand()) {
    await rename(interaction);
  } else if (interaction.isAutocomplete()) {
    await autocompleteCommands(interaction);
  }
}

async function rename(interaction: CommandInteraction) {
  const name = interaction.options.getString("meme");
  const newName = interaction.options.getString("name").trim();
  const command = await Command.findOne({ where: { name }, include: Meme });

  if (!command) {
    throw new CommandError("Could not find meme by that name!");
  }

  if (await Meme.findOne({ where: { name: newName } })) {
    throw new CommandError("A meme with this name already exists!");
  }

  const meme = command.Meme;
  const oldName = meme.name;
  meme.name = newName;
  await meme.save();

  await interaction.reply(`Updated *${oldName}* to *${newName}*`);
}
