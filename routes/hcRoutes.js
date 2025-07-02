// Express router for health check endpoint
const { express } = require("../config/constants/packages");
const { hc } = require("../controllers/hcController");

const router = express.Router();

// Health check route to verify server status
router.get("/hc", hc);

module.exports = router;
