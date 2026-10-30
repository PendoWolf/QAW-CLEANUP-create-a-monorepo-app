import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3001;
const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim());

createApp(corsOrigins).listen(port, () => {
  console.log(`Crewdesk API on port ${port}, allowing ${corsOrigins.join(", ")}`);
});
