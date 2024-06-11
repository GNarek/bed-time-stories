import express from "express";
import bodyParser from "body-parser";
import routes from "./routes";

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

export default app;
