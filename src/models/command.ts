import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "sequelize";
import { sequelize } from "../db";
import { Meme } from "./meme";

export class Command extends Model<
  InferAttributes<Command>,
  InferCreationAttributes<Command>
> {
  declare name: string;
  declare Meme?: NonAttribute<Meme>;
}

Command.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  { sequelize }
);
