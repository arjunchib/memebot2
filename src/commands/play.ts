import {
  ApplicationCommandData,
  CommandInteraction,
  Interaction,
} from "discord.js";
import fs from "fs";
import { Meme } from "../models/meme";
import { Command } from "../models/command";
import { playStream } from "../play-stream";
import { autocompleteCommands } from "../autocomplete";
import { getVoiceConnection } from "@discordjs/voice";
import { CommandError } from "../util";

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
    await autocompleteCommands(interaction);
  }
}

async function play(interaction: CommandInteraction) {
  if (!("voice" in interaction.member) || !interaction.member.voice.channel) {
    throw new CommandError("Must be connected to voice channel");
  }
  if (getVoiceConnection(interaction.guildId)) {
    throw new CommandError("Sorry busy 💅");
  }
  const name = interaction.options.getString("meme");
  const command = await Command.findOne({ where: { name }, include: Meme });
  if (command == null) {
    throw new CommandError("Could not find a meme with that command!");
  }
  const meme = command.Meme;
  const stream = fs.createReadStream(`./audio/${meme.id}.webm`);
  playStream(interaction, stream);
  await interaction.reply(`Playing *${name}*`);
  await meme.increment("playCount");
}
