import axios from "axios";
import { v5 as uuidv5 } from "uuid";
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

const res = await axios.get(`${memeArchiveHost}/memes/all.json`);
const memes = res.data;
const legacyMemes = JSON.parse(
  await fs.readFile("legacy-memes.json", { encoding: "utf8" })
);

// Get files or create dir if not present
let files = [];
try {
  files = await fs.readdir("./audio");
} catch {
  await fs.mkdir("./audio");
}

const newMemes = await Promise.all(
  memes.map(async (m) => {
    // Generate a consistent id (so no need to re-download audio)
    const id = uuidv5(m.id.toString(), "d9ad689b-57d5-4938-b216-7c24ad353462");

    // Download audio if not present
    const file = `./audio/${id}.webm`;
    if (!files.includes(`${id}.webm`)) {
      const url = m.audio_opus.startsWith("http")
        ? m.audio_opus
        : `http://127.0.0.1:3000${m.audio_opus}`;
      await download(url, file);
    }

    // Analyze audio
    const { duration, size, bit_rate } = await probe(file);

    // Create meme for db insertion
    return {
      id,
      name: m.name,
      duration,
      size,
      bit_rate,
      loudness_i: m.loudness_i,
      loudness_lra: m.loudness_lra,
      loudness_tp: m.loudness_tp,
      loudness_thresh: m.loudness_thresh,
      createdAt: new Date(m.created_at),
      updatedAt: new Date(m.updated_at),
      author_id: legacyMemes.find((l) => l.name === m.name)?.author?.id || null,
      Commands: m.commands.map((name) => {
        return { name };
      }),
    };
  })
);

// Delete unused audio files
for (const f of files) {
  if (!newMemes.some((m) => `${m.id}.webm` === f)) {
    await fs.unlink(f);
  }
}

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
      memeId: newMemes.find((n) => n.name === m.name).id,
      tagName: t,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
});
const queryInterface = sequelize.getQueryInterface();
queryInterface.bulkInsert("MemeTags", newMemeTags, {});
