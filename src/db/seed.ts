import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import axios from "axios";
import { Duplex } from "stream";
import { v4 as uuidv4 } from "uuid";
import { Command } from "../models/command";
import { Meme } from "../models/meme";
import { Tag } from "../models/tag";
import fs from "fs/promises";

Meme.destroy({ truncate: true });
Command.destroy({ truncate: true });
Tag.destroy({ truncate: true });
try {
  const files = await fs.readdir("./audio");
  Promise.all(files.map((f) => fs.unlink(`./audio/${f}`)));
} catch {
  await fs.mkdir("./audio");
}

const res = await axios.get("https://archive.memebot.life/memes/all.json");

const memes = res.data.slice(0, 10).map((m) => {
  return {
    ...m,
    id: uuidv4(),
  };
});

const ffmpeg = createFFmpeg({ log: false });
if (!ffmpeg.isLoaded()) {
  await ffmpeg.load();
}

// await Promise.(
//   memes.map(async (m) => {
//     ffmpeg.FS("writeFile", "meme.webm", await fetchFile(m.audio_opus));
//     await ffmpeg.run("meme.webm", "out.webm");
//     const stream = new Duplex();
//     stream.push(ffmpeg.FS("readFile", "out.webm"));
//     stream.push(null);
//     return fs.promises.writeFile(`./audio/${m.id}.webm`, stream);
//   })
// );

for (const m of memes) {
  ffmpeg.FS("writeFile", "meme.webm", await fetchFile(m.audio_opus));
  await ffmpeg.run("-i", "meme.webm", "out.webm");
  const stream = new Duplex();
  stream.push(ffmpeg.FS("readFile", "out.webm"));
  stream.push(null);
  await fs.writeFile(`./audio/${m.id}.webm`, stream);
}

const newMemes = memes.map((m) => {
  return {
    id: m.id,
    name: m.name,
    Commands: m.commands.map((name) => {
      return { name };
    }),
    Tags: m.tags.map((name) => {
      return { name };
    }),
  };
});

await Meme.bulkCreate(newMemes, { include: [Command, Tag] });
