import {
  ApplicationCommandData,
  AutocompleteInteraction,
  CommandInteraction,
  Interaction,
} from "discord.js";
import {
  joinVoiceChannel,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
  createAudioPlayer,
} from "@discordjs/voice";
import fs from "fs";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { Op } from "sequelize";

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
    await autocomplete(interaction);
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
