import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "memebot.sqlite",
});

export const umzug = new Umzug({
  migrations: {
    glob: "./dist/migrations/*.js",
    resolve: (params) => {
      if (params.path.endsWith(".mjs") || params.path.endsWith(".js")) {
        const getModule = () =>
          import(`file:///${params.path.replace(/\\/g, "/")}`);
        return {
          name: params.name,
          path: params.path,
          up: async (upParams) => (await getModule()).up(upParams),
          down: async (downParams) => (await getModule()).down(downParams),
        };
      }
      return {
        name: params.name,
        path: params.path,
        ...require(params.path),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

umzug.runAsCLI();
