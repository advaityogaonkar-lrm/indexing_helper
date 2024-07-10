import e from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import { router } from "./src/configs/configs.route.js";
const app = e();

// Load env
config({ path: "./.env" });

app.use(helmet());

app.use(cors());

app.use(morgan("combined"));

app.use(e.json());

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-type"],
};

app.use(cors(corsOptions));
const port = process.env.PORT || 4000;

app.use("/api/v1/configs", router);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("server started at port : ", port);
});
