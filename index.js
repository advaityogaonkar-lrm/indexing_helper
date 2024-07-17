import e from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import { router } from "./src/configs/configs.route.js";
import { testRouter } from "./src/test/test.route.js";
import https from "https";
import fs from "fs";

const app = e();

// Load env
config({ path: "./.env" });

app.use(helmet());

app.use(cors());

app.use(morgan("combined"));

app.use(e.json());

const httpsOptions = {
  key: fs.readFileSync(
    "/home/advaityogaonkar/Documents/NASA/indexing-helper/ssl_keys/key.pem"
  ),
  cert: fs.readFileSync(
    "/home/advaityogaonkar/Documents/NASA/indexing-helper/ssl_keys/cert.pem"
  ),
};

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-type"],
};

app.use(cors(corsOptions));
const port = process.env.PORT || 4000;

app.use("/api/v1/configs", router);
app.use("/api/v1/test", testRouter);

app.get("/", (req, res) => {
  res.send("Hello world");
});

https.createServer(httpsOptions, app).listen(port, () => {
  console.log("server started at port : ", port);
});
