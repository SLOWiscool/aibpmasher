import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

export default async function handler(req, res) {
  const { a, b } = req.body;

  const out = "/tmp/mash.mp3";

  ffmpeg()
    .input(a)
    .input(b)
    .complexFilter([
      "[0:a]volume=1[a0]",
      "[1:a]volume=1[a1]",
      "[a0][a1]amix=inputs=2:duration=longest"
    ])
    .on("end", () => {
      const file = fs.readFileSync(out);
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(file);
    })
    .save(out);
}
