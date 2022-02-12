import { AutocompleteInteraction } from "discord.js";
import { Op } from "sequelize";
import { Command, Tag } from "./models";

export async function autocomplete(
  interaction: AutocompleteInteraction,
  choiceFn: (value: string) => Promise<string[]>
) {
  const value = interaction.options.getFocused().toString();
  let choices = await choiceFn(value);
  await interaction.respond(choices.map((c) => ({ name: c, value: c })));
}

export const getCommandChoices = async (value: string) => {
  const commands = await Command.findAll({
    where: { name: { [Op.startsWith]: value } },
    limit: 25,
    attributes: ["name"],
  });
  return commands.map((c) => c.name);
};

export const getTagChoices = async (value: string) => {
  const tags = await Tag.findAll({
    where: { name: { [Op.startsWith]: value } },
    limit: 25,
    attributes: ["name"],
  });
  return tags.map((t) => t.name);
};
