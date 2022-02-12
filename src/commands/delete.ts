import {
  ApplicationCommandData,
  ButtonInteraction,
  CommandInteraction,
  Interaction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { Meme, Tag, Command } from "../models";
import { autocompleteCommands } from "../autocomplete";
import fs from "fs/promises";

export const command: ApplicationCommandData = {
  name: "delete",
  description: "Destroy the meme",
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

const memes = new Map<string, Meme>();

export async function run(interaction: Interaction) {
  if (interaction.isCommand()) {
    await destroy(interaction);
  } else if (interaction.isAutocomplete()) {
    await autocompleteCommands(interaction);
  } else if (interaction.isButton()) {
    await button(interaction);
  }
}

async function destroy(interaction: CommandInteraction) {
  const name = interaction.options.getString("meme");

  const command = await Command.findOne({
    where: { name },
    include: { model: Meme, include: [Command, Tag] },
  });

  if (!command) {
    return await interaction.reply({
      content: "Cannot find meme by that name!",
      ephemeral: true,
    });
  }

  memes.set(interaction.user.id, command.Meme);

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("delete")
      .setLabel("Delete")
      .setStyle("DANGER"),
    new MessageButton()
      .setCustomId("skip")
      .setLabel("Skip")
      .setStyle("SECONDARY")
  );

  await interaction.reply({
    content: "Are you sure you want to delete this meme?",
    components: [row],
  });
}

async function button(interaction: ButtonInteraction) {
  if (interaction.customId === "delete") {
    const meme = memes.get(interaction.user.id);
    meme.Commands;
    await fs.unlink(`./audio/${meme.id}.webm`);
    await meme.destroy();
    await Promise.all(
      meme.Tags.map(async (t) => {
        if ((await t.countMemes()) <= 0) {
          t.destroy();
        }
      })
    );
    await interaction.update({
      content: `Deleted *${meme.name}*`,
      components: [],
    });
  } else {
    await interaction.update({ content: "Skipped!", components: [] });
  }
}
