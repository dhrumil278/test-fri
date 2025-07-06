const hcRoutes = require("./hcRoutes");
const adminRoutes = require("./adminRoutes");
const userRoutes = require("./userRoutes");
const referralLinkRoutes = require("./referralLinkRoutes");

const routes = (app) => {
  app.use("/", hcRoutes);
  app.use("/admin", adminRoutes);
  // User-related routes
  app.use("/user", userRoutes);
  // Referral link routes
  app.use("/referral-link", referralLinkRoutes);
};

module.exports = { routes };
