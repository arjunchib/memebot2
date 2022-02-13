import {
  MessageActionRow,
  ButtonInteraction,
  BaseCommandInteraction,
  MessageButton,
  CommandInteraction,
  ApplicationCommandData,
  Interaction,
  GuildMember,
} from "discord.js";
import ytdl from "ytdl-core";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Duplex } from "stream";
import { Meme } from "../models/meme.js";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { playStream } from "../play-stream.js";
import { getVoiceConnection } from "@discordjs/voice";

const ffmpeg = createFFmpeg({ log: false });
const memes = new Map<string, Meme>();

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
      name: "name",
      description: "Display name",
      type: 3,
      required: true,
    },
    {
      name: "start",
      description: "Start time (from beginning if omitted)",
      type: 3,
    },
    {
      name: "end",
      description: "End time (to end if omitted)",
      type: 3,
    },
  ],
};

export async function run(interaction: BaseCommandInteraction) {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
  if (interaction.isCommand()) {
    await runCommand(interaction);
  } else if (interaction.isButton()) {
    await runButton(interaction);
  }
}

function userFile(interaction: Interaction) {
  return `${interaction.user.id}.webm`;
}

async function runCommand(interaction: CommandInteraction) {
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

  const url = interaction.options.getString("url");
  const name = interaction.options.getString("name");
  const start = interaction.options.getString("start");
  const end = interaction.options.getString("end");

  if (await Meme.findOne({ where: { name } })) {
    return await interaction.reply({
      content: "A meme with this name already exists!",
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  let info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: (format) => format.codecs === "opus" && format.container === "webm",
  });
  const outFile = userFile(interaction);
  ffmpeg.FS("writeFile", "meme.webm", await fetchFile(format.url));
  const cmd: string[] = [];
  if (start) cmd.push("-ss", start);
  if (end) cmd.push("-to", end);
  cmd.push("-i", "meme.webm");
  const arg = await getLoudnormArg(cmd);
  cmd.push("-af", arg);
  cmd.push(outFile);
  await ffmpeg.run(...cmd);
  const stream = new Duplex();
  stream.push(ffmpeg.FS("readFile", outFile));
  stream.push(null);

  playStream(interaction, stream);

  memes.set(interaction.user.id, Meme.build({ name }));

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

  await interaction.editReply({
    content: "Do you want to save this meme?",
    components: [row],
  });
}

async function runButton(interaction: ButtonInteraction) {
  if (interaction.customId === "save") {
    const meme = memes.get(interaction.user.id);
    const id = uuidv4();
    await fs.writeFile(
      `./audio/${id}.webm`,
      ffmpeg.FS("readFile", userFile(interaction))
    );
    meme.id = id;
    await meme?.save();
    const name = meme.name;
    await meme.createCommand({ name });
    await interaction.update({ content: "Saved!", components: [] });
    const author = (interaction.member as GuildMember).displayName;
    await interaction.channel.send({
      content: `Added *${name}* by *${author}*`,
    });
  } else {
    memes.delete(interaction.user.id);
    await interaction.update({ content: "Skipped!", components: [] });
  }
}

async function getLoudnormArg(cmd: string[]): Promise<string> {
  cmd = [...cmd];
  cmd.push("-af", "loudnorm=I=-23:LRA=7:tp=-2:print_format=json");
  cmd.push("-f", "null", "-");
  let shouldLog = false;
  let log = "";
  ffmpeg.setLogger(({ message }) => {
    if (message === "{") {
      shouldLog = true;
    }
    if (shouldLog) {
      log += message;
    }
    if (message === "}") {
      shouldLog = false;
    }
  });
  await ffmpeg.run(...cmd);
  const measured = JSON.parse(log);
  return `loudnorm=I=-23:LRA=7:tp=-2:measured_I=${measured.input_i}:measured_LRA=${measured.input_lra}:measured_tp=${measured.input_tp}:measured_thresh=${measured.input_thresh}`;
}
