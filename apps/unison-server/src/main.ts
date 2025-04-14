import { createApp } from "./app";

async function main() {
  const app = await createApp()

  const port = process.env.PORT || 3333;

  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  });

  server.on('error', console.error);
}

main().then()