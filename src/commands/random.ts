import { ApplicationCommandData, CommandInteraction } from "discord.js";
import fs from "fs";
import { Meme } from "../models/meme";
import { sequelize } from "../db";
import { playStream } from "../play-stream";
import { getVoiceConnection } from "@discordjs/voice";
import { CommandError } from "../util";
import { Tag } from "../models";
import { autocompleteTags } from "../autocomplete";

export const command: ApplicationCommandData = {
  name: "random",
  description: "Play a random meme",
  options: [
    {
      name: "tag",
      description: "Limit to memes within a tag",
      type: "STRING",
      autocomplete: true,
    },
  ],
};

export async function run(interaction: CommandInteraction) {
  if (interaction.isAutocomplete()) {
    return await autocompleteTags(interaction);
  }
  if (!("voice" in interaction.member) || !interaction.member.voice.channel) {
    throw new CommandError("Must be connected to voice channel");
  }
  if (getVoiceConnection(interaction.guildId)) {
    throw new CommandError("Sorry busy 💅");
  }
  let meme: Meme;
  const tagName = interaction.options.getString("tag")?.trim();
  if (tagName) {
    const tag = await Tag.findByPk(tagName, {
      include: {
        model: Meme,
        order: sequelize.random(),
        limit: 1,
        separate: false,
      },
    });
    if (!tag) {
      throw new CommandError("Could not find tag by that name!");
    }
    meme = tag.Memes[0];
  } else {
    meme = await Meme.findOne({ order: sequelize.random() });
  }
  const stream = fs.createReadStream(`./audio/${meme.id}.webm`);
  playStream(interaction, stream);
  await interaction.reply(`Playing *${meme.name}*`);
  await meme.increment("randomPlayCount");
}
