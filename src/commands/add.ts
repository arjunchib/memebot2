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
import { download, loudnorm, probe, waveform } from "../audio.js";
import { upload } from "../storage.js";
import { CommandError, validateName } from "../util.js";

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
    throw new CommandError("Must be connected to voice channel");
  }

  if (getVoiceConnection(interaction.guildId)) {
    throw new CommandError("Sorry busy 💅");
  }

  const url = interaction.options.getString("url");
  const name = interaction.options.getString("name");
  const start = interaction.options.getString("start");
  const end = interaction.options.getString("end");

  if (!ytdl.validateURL(url)) {
    throw new CommandError("Meme url must be a valid youtube URL!");
  }

  if (!validateName(name)) {
    throw new CommandError(
      "Meme name may only contain alphanumeric characters or period!"
    );
  }

  if (await Meme.findOne({ where: { name } })) {
    throw new CommandError("A meme with this name already exists!");
  }

  await interaction.deferReply({ ephemeral: true });

  let info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: (format) => format.codecs === "opus" && format.container === "webm",
  });
  const inFile = rawFile(interaction);
  const outFile = normalizedFile(interaction);

  await download(format.url, inFile, { start, end });
  let loudness = await loudnorm(inFile);
  loudness = await loudnorm(inFile, outFile, loudness);

  playStream(interaction, fs.createReadStream(outFile));

  const results = await probe(outFile);
  const {
    output_i: loudness_i,
    output_lra: loudness_lra,
    output_thresh: loudness_thresh,
    output_tp: loudness_tp,
  } = loudness;
  memes.set(
    interaction.user.id,
    Meme.build({
      name,
      author_id: interaction.user.id,
      loudness_i,
      loudness_lra,
      loudness_thresh,
      loudness_tp,
      ...results,
    })
  );

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
    const file = `audio/${id}.webm`;
    await fs.promises.copyFile(normalizedFile(interaction), file);
    meme.id = id;
    await meme?.save();
    const name = meme.name;
    await meme.createCommand({ name });
    const stream = waveform(file);
    await upload(`waveforms/${id}.png`, stream.stdout);
    await upload(file, fs.createReadStream(file));
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
