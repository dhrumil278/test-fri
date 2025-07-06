// Express router for referral link management endpoints
const { express } = require("../config/constants/packages");
const referralLinkController = require("../controllers/user/referralLink/referralLinkController");
const router = express.Router();
const authenticateUser = require("../middlewares/authenticateUser");

/**
 * REFERRAL LINK ROUTES
 */
// Create a new referral link
router.post("/create", authenticateUser, referralLinkController.create);

// List all referral links
router.get("/list", authenticateUser, referralLinkController.listReferralLinks);

// Get referral links by user ID
router.get(
  "/user/:id",
  authenticateUser,
  referralLinkController.getReferralLinksByUserId
);

// Get referral link by haxCode (public endpoint)
router.post("/get-by-haxcode", referralLinkController.getReferralLinkByHaxCode);

// Update referral link details by ID
router.put("/update/:id", authenticateUser, referralLinkController.update);

// Delete a referral link by ID
router.delete(
  "/delete/:id",
  authenticateUser,
  referralLinkController.deleteReferralLink
);

// Get referral link by ID
router.get("/:id", authenticateUser, referralLinkController.getReferralLink);

module.exports = router;
