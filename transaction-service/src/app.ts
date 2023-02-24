import express from "express";
import morgan from "morgan";
import "dotenv/config";
import "reflect-metadata";
import appDataSource from "./appDataSource";
import * as transactionController from "./controllers/transaction";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("port", process.env.PORT);
app.set("host", process.env.HOST);

appDataSource.initialize();

transactionController.antifraudConsumer();

app.post("/api/v1.0/transactions", transactionController.createTransaction);
app.get("/api/v1.0/transactions/:id", transactionController.getTransactionById);

app.listen(app.get("port"), app.get("host"), () => {
  console.info(
    `Microservicio corriendo en http://${app.get("host")}:${app.get("port")}`
  );
});
