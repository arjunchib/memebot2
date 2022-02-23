import { Meme } from "../src/models";
import { upload } from "../src/storage";
import fs from "fs";

const memes = await Meme.findAll();

await Promise.allSettled(
  memes.map(async (m) => {
    const file = `audio/${m.id}.webm`;
    return upload(file, fs.createReadStream(file));
  })
);
