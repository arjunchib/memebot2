import { ApplicationCommandData, CommandInteraction } from "discord.js";
import fs from "fs";
import { Meme } from "../models/meme";
import { sequelize } from "../db";
import { playStream } from "../play-stream";
import { getVoiceConnection } from "@discordjs/voice";
import { CommandError } from "../util";

export const command: ApplicationCommandData = {
  name: "random",
  description: "Play a random meme",
};

export async function run(interaction: CommandInteraction) {
  if (!("voice" in interaction.member) || !interaction.member.voice.channel) {
    throw new CommandError("Must be connected to voice channel");
  }
  if (getVoiceConnection(interaction.guildId)) {
    throw new CommandError("Sorry busy 💅");
  }
  const meme = await Meme.findOne({ order: sequelize.random() });
  const stream = fs.createReadStream(`./audio/${meme.id}.webm`);
  playStream(interaction, stream);
  await interaction.reply(`Playing *${meme.name}*`);
  await meme.increment("randomPlayCount");
}
