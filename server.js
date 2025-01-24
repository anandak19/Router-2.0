import { app } from "./app.js";
import connectDB from "./config/db.js";
// import backupJob from "./jobs/backupJob.js"
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});