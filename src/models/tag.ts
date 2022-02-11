import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  HasManyCountAssociationsMixin,
  HasManyGetAssociationsMixin,
} from "sequelize";
import { sequelize } from "../db";
import type { Meme } from "./meme";

export class Tag extends Model<
  InferAttributes<Tag>,
  InferCreationAttributes<Tag>
> {
  declare name: string;
  declare countMemes: HasManyCountAssociationsMixin;
  declare getMemes: HasManyGetAssociationsMixin<Meme>;
  declare Memes: NonAttribute<Meme[]>;
}

Tag.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  { sequelize }
);
