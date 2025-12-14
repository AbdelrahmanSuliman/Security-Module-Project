import express from "express";
import patientRoutes from "./routes/patient.routes";
import authRoutes from "./routes/auth.routes";
import doctorRoutes from "./routes/doctor.routes";
import nurseRoutes from "./routes/nurse.routes";
import adminRoutes from "./routes/admin.routes";
import cors from "cors";
import fs from "fs";
import https from "https";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://localhost:5173"],
      },
    },
  })
);

app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/nurse", nurseRoutes);

const httpsOptions = {
  key: fs.readFileSync("cert/localhost-key.pem"),
  cert: fs.readFileSync("cert/localhost.pem"),
};

https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});
