import {
  ApplicationCommandData,
  AutocompleteInteraction,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { Op } from "sequelize";
import { Tag } from "../models";

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
    await autocomplete(interaction);
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

async function autocomplete(interaction: AutocompleteInteraction) {
  const value = interaction.options.getFocused().toString();
  const commands = await Command.findAll({
    where: { name: { [Op.startsWith]: value } },
    limit: 25,
    attributes: ["name"],
  });
  await interaction.respond(
    commands.map((c) => ({ name: c.name, value: c.name }))
  );
}
