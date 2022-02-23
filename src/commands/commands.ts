import {
  ApplicationCommandData,
  AutocompleteInteraction,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { autocompleteCommands } from "../autocomplete";
import { CommandError, validateName } from "../util";

export const command: ApplicationCommandData = {
  name: "commands",
  description: "Manage commands",
  options: [
    {
      name: "add",
      description: "Add commands",
      type: 1,
      options: [
        {
          name: "meme",
          description: "Command",
          type: 3,
          required: true,
          autocomplete: true,
        },
        {
          name: "name",
          description: "Names separated by commas",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Remove commands",
      type: 1,
      options: [
        {
          name: "meme",
          description: "Command",
          type: 3,
          required: true,
          autocomplete: true,
        },
        {
          name: "name",
          description: "Names separated by commas",
          type: 3,
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],
};

export async function run(interaction: Interaction) {
  if (interaction.isCommand()) {
    await modify(interaction);
  } else if (interaction.isAutocomplete()) {
    const { name } = interaction.options.getFocused(true);
    if (name === "meme") {
      await autocompleteCommands(interaction);
    } else if (name === "name") {
      await autocompleteMemeCommands(interaction);
    }
  }
}

async function modify(interaction: CommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const name = interaction.options.getString("meme");
  const nameInput = interaction.options.getString("name");
  const command = await Command.findOne({ where: { name }, include: Meme });

  if (!command) {
    throw new CommandError("Could not find a meme with that command!");
  }

  const meme = command.Meme;
  const names = nameInput.split(",").map((n) => n.trim());

  if (!names.every((n) => validateName(n))) {
    throw new CommandError(
      "Command names may only contain alphanumeric characters or period!"
    );
  }

  if (sub === "add") {
    const commands = await Promise.all(
      names.map((n) => meme.createCommand({ name: n }))
    );
    await interaction.reply(
      `Added *${commands.map((c) => c.name).join(", ")}* to *${meme.name}*`
    );
  } else if (sub === "remove") {
    const commands = await meme.getCommands({
      where: { name: names },
    });
    await Promise.all(commands.map((c) => c.destroy()));
    await interaction.reply(
      `Deleted *${commands.map((c) => c.name).join(", ")}* from *${meme.name}*`
    );
  }
}

async function autocompleteMemeCommands(interaction: AutocompleteInteraction) {
  const name = interaction.options.getString("meme");
  const command = await Command.findOne({
    where: { name },
    include: { model: Meme, include: [Command] },
  });
  if (!command) return interaction.respond([]);
  const choices = command.Meme.Commands.map((c) => c.name);
  const value = interaction.options.getFocused().toString();
  await interaction.respond(
    choices
      .filter((c) => c.startsWith(value))
      .map((c) => {
        return { name: c, value: c };
      })
  );
}
