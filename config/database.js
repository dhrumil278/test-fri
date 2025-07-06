const { Sequelize, DataTypes, FS, PATH } = require("./constants/packages");

const checkDatabaseConnection = async (sequelize) => {
  try {
    await sequelize.authenticate();

    await sequelize.sync({ alter: true });
    console.log("Connected to database successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const customLogger = (msg) => {
  // Log only error or warning messages
  if (msg.includes("ERROR") || msg.includes("WARNING")) {
    console.error(msg);
  }
};

const DATABASE = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: customLogger,
  }
);

const initializeAssociations = () => {
  const modelsFolder = PATH.join(__dirname, "../models");
  const basename = PATH.basename(modelsFolder);
  const databaseModels = {};
  FS.readdirSync(modelsFolder)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
      );
    })
    .forEach((file) => {
      const model = require(PATH.join(modelsFolder, file));
      databaseModels[model.name] = model;
    });

  Object.keys(databaseModels).forEach((modelName) => {
    if (databaseModels[modelName].associate) {
      databaseModels[modelName].associate(databaseModels); // Call the associate method
    }
  });
};

module.exports = {
  DATABASE,
  checkDatabaseConnection,
  DATABASE_DATATYPES: DataTypes,
  initializeAssociations,
};
