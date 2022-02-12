import { AutocompleteInteraction } from "discord.js";
import { Op } from "sequelize";
import { Command } from "./models";

export async function autocompleteCommands(
  interaction: AutocompleteInteraction
) {
  const value = interaction.options.getFocused().toString();
  const commands = await Command.findAll({
    where: { name: { [Op.startsWith]: value } },
    limit: 25,
    attributes: ["name"],
  });
  await interaction.respond(
    commands.map((c) => ({ name: c.name, value: c.name }))
  );
}
