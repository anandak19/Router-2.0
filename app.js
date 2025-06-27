import express from "express";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import routerRoute from "./routes/router.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import expenseRoutes from "./routes/expense.routes.js";

export const app = express();
// add allowd orgin here after development
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to backend");
});

app.use("/api/user", userRoutes);
app.use("/api/router", routerRoute);
app.use("/api/expense", expenseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);
