import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  const chunks = [];

  req.on("data", chunk => chunks.push(chunk));

  req.on("end", async () => {
    const buffer = Buffer.concat(chunks);

    const filename = uuidv4() + ".mp3";
    const filePath = path.join("/tmp", filename);

    fs.writeFileSync(filePath, buffer);

    res.json({ url: filePath });
  });
}
