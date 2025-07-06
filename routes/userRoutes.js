// Express router for branch-related authentication and management endpoints
const { express } = require("../config/constants/packages");
const authController = require("../controllers/user/auth/authController");
const router = express.Router();
const authenticateUser = require("../middlewares/authenticateUser");

// Middleware array for routes requiring user authentication
const userMiddlewareArray = [authenticateUser];

/**
 * BRANCH AUTH ROUTES
 */
// Login endpoint for branch
router.post("/login", authController.login);

// Change password for the current branch (branch only)
router.post(
  "/change-password",
  ...userMiddlewareArray,
  authController.changePassword
);

// Forgot password endpoint
router.post("/forgot-password", authController.forgotPassword);

// Verify password reset token
router.post("/verify-token", authController.verifyToken);

// Reset password endpoint
router.post("/reset-password", authController.resetPassword);

// Logout endpoint for branch (branch only)
router.post("/logout", ...userMiddlewareArray, authController.logout);

/**
 * BRANCH PROFILE ROUTES
 */
// Get current branch profile (branch only)
router.get("/profile", ...userMiddlewareArray, authController.getUser);

module.exports = router;
