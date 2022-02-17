import { DataTypes, QueryInterface } from "sequelize";
import { MigrationFn } from "umzug";

export const up: MigrationFn<QueryInterface> = async ({
  context: queryInterface,
}) => {
  await queryInterface.addColumn("memes", "duration", {
    type: DataTypes.FLOAT,
  });
  await queryInterface.addColumn("memes", "size", {
    type: DataTypes.INTEGER,
  });
  await queryInterface.addColumn("memes", "bit_rate", {
    type: DataTypes.INTEGER,
  });
  await queryInterface.addColumn("memes", "loudness_i", {
    type: DataTypes.FLOAT,
  });
  await queryInterface.addColumn("memes", "loudness_lra", {
    type: DataTypes.FLOAT,
  });
  await queryInterface.addColumn("memes", "loudness_tp", {
    type: DataTypes.FLOAT,
  });
  await queryInterface.addColumn("memes", "loudness_thresh", {
    type: DataTypes.FLOAT,
  });
  await queryInterface.addColumn("memes", "author_id", {
    type: DataTypes.STRING,
  });
};

export const down: MigrationFn<QueryInterface> = async ({
  context: queryInterface,
}) => {
  await queryInterface.removeColumn("memes", "duration");
  await queryInterface.removeColumn("memes", "size");
  await queryInterface.removeColumn("memes", "bit_rate");
  await queryInterface.removeColumn("memes", "loudness_i");
  await queryInterface.removeColumn("memes", "loudness_lra");
  await queryInterface.removeColumn("memes", "loudness_tp");
  await queryInterface.removeColumn("memes", "loudness_thresh");
  await queryInterface.removeColumn("memes", "author_id");
};
