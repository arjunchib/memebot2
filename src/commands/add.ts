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
import { Meme } from "../models/meme.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { playStream } from "../play-stream.js";
import { getVoiceConnection } from "@discordjs/voice";
import { spawn } from "child_process";

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
  if (interaction.isCommand()) {
    await runCommand(interaction);
  } else if (interaction.isButton()) {
    await runButton(interaction);
  }
}

function normalizedFile(interaction: Interaction) {
  return `.temp/${interaction.user.id}.webm`;
}

function rawFile(interaction: Interaction) {
  return `.temp/${interaction.user.id}-raw.webm`;
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
  const inFile = rawFile(interaction);
  const outFile = normalizedFile(interaction);
  const cmd: string[] = ["-hide_banner", "-y"];
  if (start) cmd.push("-ss", start);
  if (end) cmd.push("-to", end);
  cmd.push("-i", format.url);
  cmd.push(inFile);
  await ffmpeg(...cmd);
  await normalizeAudio(inFile, outFile);

  playStream(interaction, fs.createReadStream(outFile));

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
    await fs.promises.copyFile(
      normalizedFile(interaction),
      `./audio/${id}.webm`
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

async function normalizeAudio(
  inputFile: string,
  outputFile: string
): Promise<any> {
  let cmd = [];
  cmd.push("-hide_banner", "-y");
  cmd.push("-i", inputFile);
  cmd.push("-af", "loudnorm=I=-23:LRA=7:tp=-2:print_format=json");
  cmd.push("-f", "null", "-");

  const output = await ffmpeg(...cmd);

  const loudnorm = JSON.parse(output.match(/{[\s\S]*}/)[0]);
  const filter = `loudnorm=I=-23:LRA=7:tp=-2:measured_I=${loudnorm.input_i}:measured_LRA=${loudnorm.input_lra}:measured_tp=${loudnorm.input_tp}:measured_thresh=${loudnorm.input_thresh}:print_format=json`;

  cmd = [];
  cmd.push("-hide_banner", "-y");
  cmd.push("-i", inputFile);
  cmd.push("-af", filter);
  cmd.push(outputFile);

  return await ffmpeg(...cmd);
}

async function ffmpeg(...cmd): Promise<string> {
  const child = spawn("ffmpeg", cmd);

  let output = "";

  child.stderr.on("data", (data) => {
    output += data.toString();
  });

  await new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (!code) resolve();
      else reject(new Error("Failed while running ffmpeg"));
    });
  });

  return output;
}
