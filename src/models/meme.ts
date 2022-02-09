import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../db";

export class Meme extends Model<
  InferAttributes<Meme>,
  InferCreationAttributes<Meme>
> {
  declare id: string;
  declare name: string;
}

Meme.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize }
);
