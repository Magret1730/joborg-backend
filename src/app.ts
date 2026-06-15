import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth-routes.js";
import userRoutes from "./routes/user-routes.js";

const allowedOrigins = ["http://localhost:5173"];

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use(express.json());

app.use("/", express.static("public/images"));

// All Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Joborg backend API is running");
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

export default app;