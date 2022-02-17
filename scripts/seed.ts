import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Command } from "../src/models/command";
import { Meme } from "../src/models/meme";
import { Tag } from "../src/models/tag";
import fs from "fs/promises";
import { sequelize } from "../src/db";
import { probe, download } from "../src/audio";
import { memeArchiveHost } from "../config.js";

function dedupe(arr: any[]): any[] {
  return [...new Set(arr)];
}

Meme.destroy({ truncate: true });
Command.destroy({ truncate: true });
Tag.destroy({ truncate: true });

try {
  const files = await fs.readdir("./audio");
  Promise.all(files.map((f) => fs.unlink(`./audio/${f}`)));
} catch {
  await fs.mkdir("./audio");
}

const res = await axios.get(`${memeArchiveHost}/memes/all.json`);

const memes = res.data.slice(0, 25).map((m) => {
  return {
    ...m,
    id: uuidv4(),
  };
}) as any[];

if (process.argv[2] === "--audio") {
  for (const m of memes) {
    const url = m.audio_opus.startsWith("http")
      ? m.audio_opus
      : `http://127.0.0.1:3000${m.audio_opus}`;
    const file = `./audio/${m.id}.webm`;
    await download(url, file);
    const { duration, size, bit_rate } = await probe(file);
    m.duration = duration;
    m.size = size;
    m.bit_rate = bit_rate;
  }
}

const newMemes = memes.map((m) => {
  return {
    id: m.id,
    name: m.name,
    duration: m.duration,
    size: m.size,
    bit_rate: m.bit_rate,
    loudness_i: m.loudness_i,
    loudness_lra: m.loudness_lra,
    loudness_tp: m.loudness_tp,
    loudness_thresh: m.loudness_thresh,
    createdAt: new Date(m.created_at),
    updatedAt: new Date(m.updated_at),
    Commands: m.commands.map((name) => {
      return { name };
    }),
  };
});
await Meme.bulkCreate(newMemes, {
  include: [Command],
});

const newTags = dedupe(memes.flatMap((m) => m.tags)).map((name) => {
  return { name };
});
await Tag.bulkCreate(newTags);

const newMemeTags = memes.flatMap((m) => {
  return m.tags.map((t) => {
    return {
      memeId: m.id,
      tagName: t,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
});
const queryInterface = sequelize.getQueryInterface();
queryInterface.bulkInsert("MemeTags", newMemeTags, {});
