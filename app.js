import express from "express";
import userRoutes from "./routes/user.routes.js";
import routerRoute from "./routes/router.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import errorHandler from "./middlewares/errorHandler.js"
import cors from "cors";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to backend");
});

app.use("/api", userRoutes);
app.use("/api", routerRoute);
app.use("/api/sales", salesRoutes)
app.use("/api/admin", adminRoutes)

app.use(errorHandler)