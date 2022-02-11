import { ApplicationCommandData, CommandInteraction } from "discord.js";
import { Meme } from "../models/meme";
import { Command } from "../models/command";

const options = [
  {
    name: "meme",
    description: "Command",
    type: 3,
    required: true,
  },
  {
    name: "name",
    description: "Names separated by commas",
    type: 3,
    required: true,
  },
];

export const command: ApplicationCommandData = {
  name: "tags",
  description: "Manage tags",
  options: [
    {
      name: "add",
      description: "Add tags",
      type: 1,
      options,
    },
    {
      name: "remove",
      description: "Remove tags",
      type: 1,
      options,
    },
  ],
};

export async function run(interaction: CommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const name = interaction.options.getString("meme");
  const nameInput = interaction.options.getString("name");

  const command = await Command.findOne({ where: { name }, include: Meme });
  const meme = command.Meme;

  const names = nameInput.split(",").map((n) => n.trim());

  if (sub === "add") {
    const tags = await Promise.all(
      names.map((n) => meme.createTag({ name: n }, { ignoreDuplicates: true }))
    );
    await interaction.reply(`Added *${tags.map((t) => t.name).join(", ")}*`);
  } else if (sub === "remove") {
    const tags = await meme.getTags({
      where: { name: names },
    });
    await meme.removeTags(tags);
    await Promise.all(
      tags.map(async (t) => {
        if ((await t.countMemes()) <= 0) {
          t.destroy();
        }
      })
    );
    await interaction.reply(`Removed *${tags.map((t) => t.name).join(", ")}*`);
  }
}
