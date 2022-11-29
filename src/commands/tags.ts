import {
  ApplicationCommandData,
  AutocompleteInteraction,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { Meme, Command, Tag } from "../models";
import { autocompleteCommands, autocompleteTags } from "../autocomplete";
import { CommandError, validateName } from "../util";

const options = [
  {
    name: "meme",
    description: "Command",
    type: 3,
    required: true,
    autocomplete: true,
  },
  {
    name: "tag",
    description: "Names separated by commas",
    type: 3,
    required: true,
    autocomplete: true,
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
    {
      name: "all",
      description: "List all tags",
      type: 1,
    },
  ],
};

export async function run(interaction: Interaction) {
  if (interaction.isAutocomplete()) {
    const sub = interaction.options.getSubcommand();
    if (sub === "list") {
      await autocompleteTags(interaction);
    } else {
      const { name } = interaction.options.getFocused(true);
      if (name === "meme") {
        await autocompleteCommands(interaction);
      } else if (name === "tag") {
        if (sub === "add") {
          await autocompleteTags(interaction);
        } else if (sub === "remove") {
          await autocompleteMemeTags(interaction);
        }
      }
    }
  } else if (interaction.isCommand()) {
    if (!interaction.isChatInputCommand()) return;
    const sub = interaction.options.getSubcommand();
    if (sub === "list") {
      await list(interaction);
    } else if (sub === "all") {
      await all(interaction);
    } else {
      await modify(interaction);
    }
  }
}

async function modify(interaction: CommandInteraction) {
  if (!interaction.isChatInputCommand()) return;
  const sub = interaction.options.getSubcommand();
  const name = interaction.options.getString("meme");
  const tagInput = interaction.options.getString("tag");
  const command = await Command.findOne({ where: { name }, include: Meme });

  if (!command) {
    throw new CommandError("Could not find meme by that name!");
  }

  const meme = command.Meme;
  const names = tagInput.split(",").map((n) => n.trim());

  if (!names.every((n) => validateName(n))) {
    throw new CommandError(
      "Tag names may only contain alphanumeric characters or period!"
    );
  }

  if (sub === "add") {
    const tags = await Promise.all(
      names.map((n) => meme.createTag({ name: n }, { ignoreDuplicates: true }))
    );
    await interaction.reply(
      `Added *${tags.map((t) => t.name).join(", ")}* to *${meme.name}*`
    );
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
    await interaction.reply(
      `Removed *${tags.map((t) => t.name).join(", ")}* from *${meme.name}*`
    );
  }
}

async function list(interaction: CommandInteraction) {
  if (!interaction.isChatInputCommand()) return;
  const name = interaction.options.getString("name");
  const tag = await Tag.findByPk(name, {
    include: { model: Meme, attributes: ["name"] },
    attributes: [],
  });
  if (!tag) {
    throw new CommandError("Could not find tag by that name!");
  }
  return await interaction.reply({
    embeds: [
      {
        fields: [{ name, value: tag.Memes.map((m) => m.name).join(", ") }],
      },
    ],
  });
}

async function all(interaction: CommandInteraction) {
  const tags = await Tag.findAll();
  return await interaction.reply({
    content: tags.map((t) => t.name).join(", "),
    ephemeral: true,
  });
}

async function autocompleteMemeTags(interaction: AutocompleteInteraction) {
  const name = interaction.options.getString("meme");
  const command = await Command.findOne({
    where: { name },
    include: { model: Meme, include: [Tag] },
  });
  const choices = command.Meme.Tags.map((t) => t.name);
  const value = interaction.options.getFocused().toString();
  await interaction.respond(
    choices
      .filter((t) => t.startsWith(value))
      .map((t) => {
        return { name: t, value: t };
      })
  );
}
