import { DataTypes, QueryInterface } from "sequelize";
import { MigrationFn } from "umzug";

export const up: MigrationFn<QueryInterface> = async ({
  context: queryInterface,
}) => {
  await queryInterface.addColumn("memes", "playCount", {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  });
};

export const down: MigrationFn<QueryInterface> = async ({
  context: queryInterface,
}) => {
  await queryInterface.removeColumn("memes", "playCount");
};
