import {
  ApplicationCommandData,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { Tag } from "../models";
import { autocompleteCommands } from "../autocomplete";

export const command: ApplicationCommandData = {
  name: "info",
  description: "Display meme information",
  options: [
    {
      name: "meme",
      description: "Name",
      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
};

export async function run(interaction: Interaction) {
  if (interaction.isCommand()) {
    await info(interaction);
  } else if (interaction.isAutocomplete()) {
    await autocompleteCommands(interaction);
  }
}

async function info(interaction: CommandInteraction) {
  const name = interaction.options.getString("meme");

  const command = await Command.findOne({
    where: { name },
    include: [{ model: Meme, include: [Command, Tag] }],
  });

  if (!command) {
    return await interaction.reply({
      content: "Could not find meme by that name!",
      ephemeral: true,
    });
  }

  const meme = command.Meme;

  await interaction.reply({
    embeds: [
      {
        title: meme.name,
        fields: [
          {
            name: "commands",
            value: meme.Commands.map((c) => c.name).join(", "),
          },
          {
            name: "tags",
            value: meme.Tags.map((t) => t.name).join(", "),
          },
        ],
      },
    ],
  });
}
