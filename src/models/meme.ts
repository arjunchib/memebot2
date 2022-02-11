import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyGetAssociationsMixin,
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
  },
  { sequelize }
);

Meme.hasMany(Command);
Command.belongsTo(Meme);

Meme.belongsToMany(Tag, { through: "MemeTags" });
Tag.belongsToMany(Meme, { through: "MemeTags" });
