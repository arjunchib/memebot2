import {
  ApplicationCommandData,
  CommandInteraction,
  ApplicationCommandOptionType,
} from "discord.js";
import { Meme } from "../models/meme";

export const command: ApplicationCommandData = {
  name: "list",
  description: "List the most recently added memes",
  options: [
    {
      name: "limit",
      description: "Number of memes to show",
      required: false,
      min_value: 1,
      max_value: 50,
      type: ApplicationCommandOptionType.Integer,
    },
  ],
};

export async function run(interaction: CommandInteraction) {
  if (!interaction.isChatInputCommand()) return;
  const limit = interaction.options.getInteger("limit") ?? 10;
  const memes = await Meme.findAll({
    limit,
    order: [["createdAt", "DESC"]],
  });
  await interaction.reply(
    memes
      .map(
        (meme) =>
          `- \`${new Intl.DateTimeFormat("en-US", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
          }).format(meme.createdAt)}\` ${meme.name}`
      )
      .join("\n") || "Sorry no memes :("
  );
}
