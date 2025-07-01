const { express } = require("../config/constants/packages");
const { hc } = require("../controllers/hcController");

const router = express.Router();

// ADMIN AUTH ROUTES
router.get("/hc", hc);

module.exports = router;
