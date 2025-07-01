// config the env
require("dotenv").config({ path: "./.env" });

const { CORS_OPTIONS } = require("./config/constants/cors");
const { express, cors } = require("./config/constants/packages");
// initialize the database
const {
  DATABASE,
  checkDatabaseConnection,
  initializeAssociations,
} = require("./config/database");
const { routes } = require("./routes/routes");

// check the database connection
checkDatabaseConnection(DATABASE);

const app = express();
const PORT = process.env.PORT;

app.use(cors(CORS_OPTIONS));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

initializeAssociations();

routes(app);

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
