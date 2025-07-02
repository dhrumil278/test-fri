// Express router for admin-related authentication and management endpoints
const { express } = require("../config/constants/packages");
const authController = require("../controllers/admin/authController");
const router = express.Router();
const authenticateSuperAdmin = require("../middlewares/authenticateSuperAdmin");

// Middleware array for routes requiring super admin authentication
const superAdminMiddlewareArray = [authenticateSuperAdmin];

// ADMIN AUTH ROUTES
// Create a new admin (super admin only)
router.post("/create", ...superAdminMiddlewareArray, authController.create);
// Change password for the current admin (super admin only)
router.post(
  "/change-password",
  ...superAdminMiddlewareArray,
  authController.changePassword
);
// Update admin details by ID (super admin only)
router.put("/update/:id", ...superAdminMiddlewareArray, authController.update);
// Delete an admin by ID (super admin only)
router.delete(
  "/delete/:id",
  ...superAdminMiddlewareArray,
  authController.deleteAdmin
);
// List all admins (super admin only)
router.get("/get", ...superAdminMiddlewareArray, authController.listAdmins);
// Generate QR code for 2FA (super admin only)
router.get(
  "/generate-qr-code",
  ...superAdminMiddlewareArray,
  authController.generateQRCode
);
// Verify 2FA OTP (no authentication required)
router.post("/verify-2fa", authController.verify2FA);
// Get current admin profile (super admin only)
router.get("/profile", ...superAdminMiddlewareArray, authController.getAdmin);
// Login endpoint for admin
router.post("/login", authController.login);
// Logout endpoint for admin (super admin only)
router.post("/logout", ...superAdminMiddlewareArray, authController.logout);
// Enable or disable 2FA for admin (super admin only)
router.post(
  "/enable-disable-2fa",
  ...superAdminMiddlewareArray,
  authController.enableDisable2FA
);
// Forgot password endpoint
router.post("/forgot-password", authController.forgotPassword);
// Verify password reset token
router.post("/verify-token", authController.verifyToken);
// Reset password endpoint
router.post("/reset-password", authController.resetPassword);

module.exports = router;
