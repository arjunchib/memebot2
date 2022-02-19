import fs from "fs/promises";

let files = await fs.readdir("memes");
// files = files.slice(0, 10);

let data = await Promise.all(files.map((f) => fs.readFile(`memes/${f}`)));
data = data.map((r) => JSON.parse(r.toString()));

await fs.writeFile("legacy-memes.json", JSON.stringify(data));
