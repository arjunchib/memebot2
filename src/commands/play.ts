import {
  ApplicationCommandData,
  AutocompleteInteraction,
  CommandInteraction,
  Interaction,
} from "discord.js";
import fs from "fs";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { Op } from "sequelize";
import { playStream } from "../play-stream";

export const command: ApplicationCommandData = {
  name: "play",
  description: "Play a meme",
  options: [
    {
      name: "meme",
      description: "Command",
      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
};

export async function run(interaction: Interaction) {
  if (interaction.isCommand()) {
    await play(interaction);
  } else if (interaction.isAutocomplete()) {
    await autocomplete(interaction);
  }
}

async function play(interaction: CommandInteraction) {
  if (!("voice" in interaction.member) || !interaction.member.voice.channel) {
    return await interaction.reply({
      content: "Must be connected to voice channel",
      ephemeral: true,
    });
  }
  const name = interaction.options.getString("meme");
  const command = await Command.findOne({ where: { name }, include: Meme });
  const meme = command.Meme;
  const stream = fs.createReadStream(`./audio/${meme.id}.webm`);
  playStream(interaction, stream);
  await interaction.reply(`Playing *${name}*`);
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
