import e from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

const app = e();
const port = process.env.PORT || 3000;

app.use(helmet());

app.use(cors());

app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("server started at port : ", port);
});
