// Load environment variables from .env file
require("dotenv").config({ path: "./.env" });

// Import CORS options and required packages
const { CORS_OPTIONS } = require("./config/constants/cors");
const { express, cors } = require("./config/constants/packages");
// Initialize database and related utilities
const {
  DATABASE,
  checkDatabaseConnection,
  initializeAssociations,
} = require("./config/database");
const { routes } = require("./routes/routes");

// Check and establish the database connection
checkDatabaseConnection(DATABASE);

// Create an Express application instance
const app = express();
const PORT = process.env.PORT;

// Enable CORS with specified options
app.use(cors(CORS_OPTIONS));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Initialize model associations (if any)
initializeAssociations();

// Register application routes
routes(app);

// Start the server and listen on the specified port
app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
