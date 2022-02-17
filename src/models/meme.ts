import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyGetAssociationsMixin,
  NonAttribute,
} from "sequelize";
import { sequelize } from "../db";
import { Command } from "./command";
import { Tag } from "./tag";

export class Meme extends Model<
  InferAttributes<Meme>,
  InferCreationAttributes<Meme>
> {
  declare id: string;
  declare name: string;
  declare duration: number;
  declare size: number;
  declare bit_rate: number;
  declare loudness_i: number;
  declare loudness_lra: number;
  declare loudness_tp: number;
  declare loudness_thresh: number;
  declare author_id: string;

  declare Commands: NonAttribute<Command[]>;
  declare Tags: NonAttribute<Tag[]>;

  declare createCommand: HasManyCreateAssociationMixin<Command, "name">;
  declare getCommands: HasManyGetAssociationsMixin<Command>;

  declare getTags: HasManyGetAssociationsMixin<Tag>;
  declare createTag: HasManyCreateAssociationMixin<Tag, "name">;
  declare removeTags: HasManyRemoveAssociationsMixin<Tag, "name">;
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
    duration: {
      type: DataTypes.FLOAT,
    },
    size: {
      type: DataTypes.INTEGER,
    },
    bit_rate: {
      type: DataTypes.INTEGER,
    },
    loudness_i: {
      type: DataTypes.FLOAT,
    },
    loudness_lra: {
      type: DataTypes.FLOAT,
    },
    loudness_tp: {
      type: DataTypes.FLOAT,
    },
    loudness_thresh: {
      type: DataTypes.FLOAT,
    },
    author_id: {
      type: DataTypes.STRING,
    },
  },
  { sequelize }
);

Meme.hasMany(Command);
Command.belongsTo(Meme);

Meme.belongsToMany(Tag, { through: "MemeTags" });
Tag.belongsToMany(Meme, { through: "MemeTags" });
