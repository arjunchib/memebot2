import { DataTypes, QueryInterface } from "sequelize";
import { MigrationFn } from "umzug";

export const up: MigrationFn<QueryInterface> = async ({
  context: queryInterface,
}) => {
  await queryInterface.createTable("commands", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    memeId: {
      type: DataTypes.INTEGER,
      references: {
        model: "memes",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};

export const down: MigrationFn<QueryInterface> = async ({
  context: queryInterface,
}) => {
  await queryInterface.dropTable("commands");
};
