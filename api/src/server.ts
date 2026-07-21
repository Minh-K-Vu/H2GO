import app from "./app";
import { ensureDatabaseSchema } from "./db/schema";
import { env } from "./config/env";

async function startServer() {
  await ensureDatabaseSchema();

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
