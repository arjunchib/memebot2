import {
  ApplicationCommandData,
  CommandInteraction,
  Interaction,
  MessageEmbed,
} from "discord.js";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { Tag } from "../models";
import { autocompleteCommands } from "../autocomplete";
import prettyBytes from "pretty-bytes";

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
  const embed = new MessageEmbed()
    .setTitle(meme.name)
    .setImage(
      `https://ewr1.vultrobjects.com/memebot-dev/waveforms/${meme.id}.png`
    )
    .addFields(
      {
        name: "commands",
        value: meme.Commands.map((c) => c.name).join(", "),
        inline: true,
      },
      {
        name: "tags",
        value: meme.Tags.map((t) => t.name).join(", ") || "No tags set",
        inline: true,
      },
      { name: "duration", value: `${meme.duration}s`, inline: true },
      {
        name: "created",
        value: new Intl.DateTimeFormat("en-US").format(meme.createdAt),
        inline: true,
      },
      {
        name: "updated",
        value: new Intl.DateTimeFormat("en-US").format(meme.updatedAt),
        inline: true,
      },
      {
        name: "plays",
        value: meme.playCount.toString(),
        inline: true,
      }
    );

  if (meme.author_id) {
    const author = await interaction.client.users.fetch(meme.author_id);
    const iconURL = await author.avatarURL();
    embed.setAuthor({ name: author.username, iconURL });
  }

  await interaction.reply({
    embeds: [embed],
  });
}
