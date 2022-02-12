import {
  ApplicationCommandData,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { autocomplete, getCommandChoices } from "../autocomplete";

const options = [
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
];

export const command: ApplicationCommandData = {
  name: "commands",
  description: "Manage commands",
  options: [
    {
      name: "add",
      description: "Add commands",
      type: 1,
      options,
    },
    {
      name: "remove",
      description: "Remove commands",
      type: 1,
      options,
    },
  ],
};

export async function run(interaction: Interaction) {
  if (interaction.isCommand()) {
    await modify(interaction);
  } else if (interaction.isAutocomplete()) {
    await autocomplete(interaction, getCommandChoices);
  }
}

async function modify(interaction: CommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const name = interaction.options.getString("meme");
  const nameInput = interaction.options.getString("name");
  const command = await Command.findOne({ where: { name }, include: Meme });
  const meme = command.Meme;
  const names = nameInput.split(",").map((n) => n.trim());
  if (sub === "add") {
    const commands = await Promise.all(
      names.map((n) => meme.createCommand({ name: n }))
    );
    await interaction.reply(
      `Added *${commands.map((c) => c.name).join(", ")}*`
    );
  } else if (sub === "remove") {
    const commands = await meme.getCommands({
      where: { name: names },
    });
    await Promise.all(commands.map((c) => c.destroy()));
    await interaction.reply(
      `Deleted *${commands.map((c) => c.name).join(", ")}*`
    );
  }
}
