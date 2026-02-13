import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));



app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: true, limit: "16mb" }));
app.use(express.static("public"));
app.use(cookieParser());


app.use('/api/', apiLimiter);

// Importing Routes
import healthRoute from "./routes/health.route.js";
import authRoute from "./routes/auth.route.js";
import taskRoute from "./routes/task.route.js";
import userRoute from "./routes/user.route.js";

// Implementing Routes
app.use("/api/v1/health", healthRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/tasks", taskRoute);
app.use("/api/v1/users", userRoute);


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to TaskVault API',
    version: '1.0.0',
    // documentation: '/api-docs'
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;