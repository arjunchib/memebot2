import {
  ApplicationCommandData,
  AutocompleteInteraction,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Meme, Command, Tag } from "../models";
import { Op } from "sequelize";

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
    {
      name: "list",
      description: "Lists memes in a tag",
      type: 1,
      options: [
        {
          name: "name",
          description: "Tag name",
          type: 3,
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],
};

export async function run(interaction: Interaction) {
  if (interaction.isAutocomplete()) {
    await autocomplete(interaction);
  } else if (interaction.isCommand()) {
    const sub = interaction.options.getSubcommand();
    if (sub === "list") {
      await list(interaction);
    } else {
      await modify(interaction);
    }
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

async function list(interaction: CommandInteraction) {
  const name = interaction.options.getString("name");
  const tag = await Tag.findByPk(name, {
    include: { model: Meme, attributes: ["name"] },
    attributes: [],
  });
  return await interaction.reply({
    embeds: [
      {
        fields: [{ name, value: tag.Memes.map((m) => m.name).join(", ") }],
      },
    ],
  });
}

async function autocomplete(interaction: AutocompleteInteraction) {
  const value = interaction.options.getFocused().toString();
  const tags = await Tag.findAll({
    where: { name: { [Op.startsWith]: value } },
    limit: 25,
    attributes: ["name"],
  });
  await interaction.respond(tags.map((t) => ({ name: t.name, value: t.name })));
}
