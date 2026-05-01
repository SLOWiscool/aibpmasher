import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb"
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { a, b } = req.body;

    if (!a || !b) {
      return res.status(400).json({ error: "Missing files" });
    }

    const outPath = path.join("/tmp", `mash-${Date.now()}.mp3`);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(a)
        .input(b)
        .complexFilter([
          "[0:a]volume=1[a0]",
          "[1:a]volume=1[a1]",
          "[a0][a1]amix=inputs=2:duration=longest:dropout_transition=2"
        ])
        .audioCodec("libmp3lame")
        .format("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(outPath);
    });

    const audio = fs.readFileSync(outPath);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=mash.mp3");

    return res.status(200).send(audio);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Mash failed", details: err.message });
  }
}
