import {
  ApplicationCommandData,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { autocompleteCommands } from "../autocomplete";

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

  if (await Meme.findOne({ where: { name: newName } })) {
    return await interaction.reply({
      content: "A meme with this name already exists!",
      ephemeral: true,
    });
  }

  const command = await Command.findOne({ where: { name }, include: Meme });
  const meme = command.Meme;
  const oldName = meme.name;
  meme.name = newName;
  await meme.save();

  await interaction.reply(`Updated *${oldName}* to *${newName}*`);
}
