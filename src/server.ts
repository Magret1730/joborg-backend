import dotenv from "dotenv";
import app from "./app.js";
import { startScheduler } from "./services/start-scheduler.service.js"

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startScheduler();
});