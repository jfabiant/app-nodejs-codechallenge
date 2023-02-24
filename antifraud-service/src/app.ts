import express from "express";
import morgan from "morgan";
import "dotenv/config";
import "reflect-metadata";
import * as antiFraudController from "./controllers/antifraud";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("port", process.env.PORT);
app.set("host", process.env.HOST);

antiFraudController.verifyTransaction();

app.listen(app.get("port"), app.get("host"), () => {
  console.info(
    `Microservicio corriendo en http://${app.get("host")}:${app.get("port")}`
  );
});