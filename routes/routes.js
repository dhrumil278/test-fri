const hcRoutes = require("./hcRoutes");
const adminRoutes = require("./adminRoutes");

const routes = (app) => {
  app.use("/", hcRoutes);
  app.use("/admin", adminRoutes);
};

module.exports = { routes };
