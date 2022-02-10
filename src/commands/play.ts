import { ApplicationCommandData, CommandInteraction } from "discord.js";
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

export const command: ApplicationCommandData = {
  name: "play",
  description: "Play a meme",
  options: [
    {
      name: "meme",
      description: "Name or alias",
      type: 3,
      required: true,
    },
  ],
};

export async function run(interaction: CommandInteraction) {
  if (!("voice" in interaction.member) || !interaction.member.voice.channel) {
    return await interaction.reply({
      content: "Must be connected to voice channel",
      ephemeral: true,
    });
  }

  const name = interaction.options.getString("meme");

  const command = await Command.findOne({ where: { name }, include: Meme });
  console.log(JSON.stringify(command, null, 2));
  const meme = command.Meme;

  const player = createAudioPlayer();

  player.on("error", (error) => {
    console.error("Error:", error.message, "with track", error.resource);
  });

  const stream = fs.createReadStream(`./audio/${meme.id}.webm`);
  const resource = createAudioResource(stream, {
    inputType: StreamType.WebmOpus,
  });

  const channel = interaction.member.voice.channel;
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: interaction.member.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  const subscription = connection.subscribe(player);
  player.play(resource);

  player.on(AudioPlayerStatus.Idle, () => {
    subscription.unsubscribe();
    connection.destroy();
  });

  await interaction.reply(`Playing *${name}*`);
}
