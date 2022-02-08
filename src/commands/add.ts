import {
  MessageActionRow,
  ButtonInteraction,
  BaseCommandInteraction,
  MessageButton,
  CommandInteraction,
  ApplicationCommandData,
} from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
} from "@discordjs/voice";
import { primaryGuildId } from "../../config.js";
import ytdl from "ytdl-core";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Duplex } from "stream";

const ffmpeg = createFFmpeg({ log: false });

export const command: ApplicationCommandData = {
  name: "add",
  description: "Add a meme",
  options: [
    {
      name: "url",
      description: "Video url",
      type: 3,
      required: true,
    },
    {
      name: "start",
      description: "Start time",
      type: 3,
      required: true,
    },
    {
      name: "end",
      description: "End time",
      type: 3,
      required: true,
    },
    {
      name: "name",
      description: "Name",
      type: 3,
      required: true,
    },
  ],
};

export async function run(interaction: BaseCommandInteraction) {
  if (interaction.isCommand()) {
    await runCommand(interaction);
  } else if (interaction.isButton()) {
    await runButton(interaction);
  }
}

function userFile(interaction: BaseCommandInteraction) {
  return `${interaction.user.id}.webm`;
}

async function runCommand(interaction: CommandInteraction) {
  if (!("voice" in interaction.member) || !interaction.member.voice.channel) {
    return await interaction.reply("Must be connected to voice channel");
  }

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  const url = interaction.options.getString("url");
  const start = interaction.options.getString("start");
  const end = interaction.options.getString("end");

  const player = createAudioPlayer();
  player.on("error", (error) => {
    console.error("Error:", error.message, "with track", error.resource);
  });

  let info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: (format) => format.codecs === "opus" && format.container === "webm",
  });
  const outFile = userFile(interaction);
  ffmpeg.FS("writeFile", "meme.webm", await fetchFile(format.url));
  await ffmpeg.run("-ss", start, "-to", end, "-i", "meme.webm", outFile);
  const stream = new Duplex();
  stream.push(ffmpeg.FS("readFile", outFile));
  stream.push(null);
  const resource = createAudioResource(stream, {
    inputType: StreamType.WebmOpus,
  });

  const channel = interaction.member.voice.channel;
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: primaryGuildId,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  const subscription = connection.subscribe(player);
  player.play(resource);

  player.on(AudioPlayerStatus.Idle, () => {
    subscription.unsubscribe();
    connection.destroy();
  });

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("save")
      .setLabel("Save")
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId("skip")
      .setLabel("Skip")
      .setStyle("SECONDARY")
  );
  await interaction.reply({
    content: "Do you want to save this meme?",
    components: [row],
    ephemeral: true,
  });
}

async function runButton(interaction: ButtonInteraction) {
  // ffmpeg.FS("readFile", outFile);
}
