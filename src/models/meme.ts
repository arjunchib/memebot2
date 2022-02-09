import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

export class Meme extends Model {}

Meme.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize }
);
