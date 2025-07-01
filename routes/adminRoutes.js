const { express } = require("../config/constants/packages");

const authController = require("../controllers/admin/authController");

const router = express.Router();

const authenticateSuperAdmin = require("../middlewares/authenticateSuperAdmin");

const superAdminMiddlewareArray = [authenticateSuperAdmin];

// ADMIN AUTH ROUTES
router.post("/create", ...superAdminMiddlewareArray, authController.create);
router.post(
  "/change-password",
  ...superAdminMiddlewareArray,
  authController.changePassword
);
router.put("/update/:id", ...superAdminMiddlewareArray, authController.update);
router.delete(
  "/delete/:id",
  ...superAdminMiddlewareArray,
  authController.deleteAdmin
);
router.get("/get", ...superAdminMiddlewareArray, authController.listAdmins);
router.get(
  "/generate-qr-code",
  ...superAdminMiddlewareArray,
  authController.generateQRCode
);
router.post("/verify-2fa", authController.verify2FA);
router.get("/profile", ...superAdminMiddlewareArray, authController.getAdmin);
router.post("/login", authController.login);
router.post("/logout", ...superAdminMiddlewareArray, authController.logout);
router.post(
  "/enable-disable-2fa",
  ...superAdminMiddlewareArray,
  authController.enableDisable2FA
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-token", authController.verifyToken);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
