const hcRoutes = require("./hcRoutes");

const routes = (app) => {
  app.use("/", hcRoutes);
};

module.exports = { routes };
