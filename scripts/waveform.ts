import { Meme } from "../src/models";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Config } from "../config";
import { spawnSync } from "child_process";

const memes = await Meme.findAll();

const { endpoint, accessKeyId, secretAccessKey, bucket } = s3Config;

const client = new S3Client({
  endpoint,
  region: "US",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

await Promise.allSettled(
  memes.map(async (m) => {
    const file = `waveforms/${m.id}.png`;
    const child = spawnSync("ffmpeg", [
      "-hide_banner",
      "-y",
      "-i",
      `audio/${m.id}.webm`,
      "-filter_complex",
      "compand,showwavespic=s=512x128:colors=white",
      "-frames:v",
      "1",
      "-c:v",
      "png",
      "-f",
      "image2",
      "-",
    ]);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Body: child.stdout,
      Key: file,
      ACL: "public-read",
      ContentType: "image/png",
    });
    return client.send(command);
  })
);
