import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  HasManyCreateAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyGetAssociationsMixin,
} from "sequelize";
import { sequelize } from "../db";
import { Command } from "./command";

export class Meme extends Model<
  InferAttributes<Meme>,
  InferCreationAttributes<Meme>
> {
  declare id: string;
  declare name: string;
  declare createCommand: HasManyCreateAssociationMixin<Command, "name">;
  declare addCommands: HasManyAddAssociationsMixin<Command, number>;
  declare getCommands: HasManyGetAssociationsMixin<Command>;
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

Meme.hasMany(Command);
Command.belongsTo(Meme);
