import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  HasManyCountAssociationsMixin,
} from "sequelize";
import { sequelize } from "../db";

export class Tag extends Model<
  InferAttributes<Tag>,
  InferCreationAttributes<Tag>
> {
  declare name: string;
  declare countMemes: HasManyCountAssociationsMixin;
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
