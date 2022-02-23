import { AutocompleteInteraction } from "discord.js";
import { Op } from "sequelize";
import { Command, Meme, Tag } from "./models";

export async function autocompleteCommands(
  interaction: AutocompleteInteraction
) {
  const value = interaction.options.getFocused().toString();
  const commands = await Command.findAll({
    where: { name: { [Op.startsWith]: value } },
    limit: 25,
    attributes: ["name"],
    include: [{ model: Meme, attributes: ["playCount"] }],
    order: [[Command.associations.Meme, "playCount", "DESC"]],
  });
  await interaction.respond(
    commands.map((c) => ({ name: c.name, value: c.name }))
  );
}

export async function autocompleteTags(interaction: AutocompleteInteraction) {
  const value = interaction.options.getFocused().toString();
  const tags = await Tag.findAll({
    where: { name: { [Op.startsWith]: value } },
    limit: 25,
    attributes: ["name"],
  });
  await interaction.respond(tags.map((t) => ({ name: t.name, value: t.name })));
}
