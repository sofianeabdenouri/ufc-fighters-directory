import fs from "fs";

const outDir = ".vercel/output";

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir + "/static", { recursive: true });

fs.cpSync("dist", outDir + "/static", { recursive: true });

fs.writeFileSync(
  outDir + "/config.json",
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: "/api/(.*)", dest: "/api/server.js" },
        { src: "/(.*)", dest: "/static/$1" }
      ]
    },
    null,
    2
  )
);
