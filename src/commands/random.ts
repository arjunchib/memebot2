import { ApplicationCommandData, CommandInteraction } from "discord.js";
import fs from "fs";
import { Meme } from "../models/meme";
import { sequelize } from "../db";
import { playStream } from "../play-stream";
import { getVoiceConnection } from "@discordjs/voice";

export const command: ApplicationCommandData = {
  name: "random",
  description: "Play a random meme",
};

export async function run(interaction: CommandInteraction) {
  if (!("voice" in interaction.member) || !interaction.member.voice.channel) {
    return await interaction.reply({
      content: "Must be connected to voice channel",
      ephemeral: true,
    });
  }
  if (getVoiceConnection(interaction.guildId)) {
    return await interaction.reply({
      content: "Sorry busy 💅",
      ephemeral: true,
    });
  }
  const meme = await Meme.findOne({ order: sequelize.random() });
  const stream = fs.createReadStream(`./audio/${meme.id}.webm`);
  playStream(interaction, stream);
  await interaction.reply(`Playing *${meme.name}*`);
}
