const { express } = require("../config/constants/packages");

const authController = require("../controllers/admin/authController");

const router = express.Router();
const branchController = require("../controllers/admin/branchController");
const authenticateSuperAdmin = require("../middlewares/authenticateSuperAdmin");
const hasAdminRole = require("../middlewares/hasAdminRole");

/**
 * ADMIN AUTH ROUTES
 */
// Login endpoint for admin
router.post("/login", authController.login);

// Change password for the current admin (super admin only)
router.post(
  "/change-password",
  authenticateSuperAdmin,
  authController.changePassword
);

// Forgot password endpoint
router.post("/forgot-password", authController.forgotPassword);

// Verify password reset token
router.post("/verify-token", authController.verifyToken);

// Reset password endpoint
router.post("/reset-password", authController.resetPassword);

// Logout endpoint for admin (super admin only)
router.post("/logout", authenticateSuperAdmin, authController.logout);

/**
 * ADMIN MANAGE ROUTES
 */
// Create a new admin (super admin only)
router.post("/create", authController.create);

// Update admin details by ID (super admin only)
router.put(
  "/update/:id",
  authenticateSuperAdmin,
  hasAdminRole,
  authController.update
);

// Delete an admin by ID (super admin only)
router.delete(
  "/delete/:id",
  authenticateSuperAdmin,
  hasAdminRole,
  authController.deleteAdmin
);

// List all admins (super admin only)
router.get("/list-admin", authenticateSuperAdmin, authController.listAdmins);

// Get current admin profile (super admin only)
router.get("/profile", authenticateSuperAdmin, authController.getAdmin);

/**
 * BRANCH MANAGE ROUTES
 */
// Create a new branch (super admin only)
router.post(
  "/branch/create",
  authenticateSuperAdmin,
  hasAdminRole,
  branchController.create
);

// Update branch details by ID (super admin only)
router.put(
  "/branch/update/:id",
  authenticateSuperAdmin,
  hasAdminRole,
  branchController.update
);

// Delete a branch by ID (super admin only)
router.delete(
  "/branch/delete/:id",
  authenticateSuperAdmin,
  hasAdminRole,
  branchController.deleteBranch
);

// List all branches (super admin only)
router.get(
  "/branch/list",
  authenticateSuperAdmin,
  branchController.listBranches
);

// Get branch by ID (super admin only)
router.get("/branch/:id", authenticateSuperAdmin, branchController.getBranch);

module.exports = router;
