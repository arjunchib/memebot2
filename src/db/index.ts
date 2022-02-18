import { Sequelize } from "sequelize";
import { logging } from "../../config.js";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "memebot.sqlite",
  logging,
});
