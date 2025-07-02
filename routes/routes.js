// Main application routes registration
const hcRoutes = require("./hcRoutes");
const adminRoutes = require("./adminRoutes");

// Register all routes with the Express app
const routes = (app) => {
  // Health check routes
  app.use("/", hcRoutes);
  // Admin-related routes
  app.use("/admin", adminRoutes);
};

module.exports = { routes };
