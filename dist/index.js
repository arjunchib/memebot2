var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import { Client, Intents } from "../node_modules/discord.js/src/index.js";

// config.js
var token = "OTM4ODAwMTI0NDYzODEyNjcx.Yfvjvw.c2-LIQzspltwfUs2xiXb-71_87I";
var primaryGuildId = "213484561127047168";

// src/commands/index.ts
var commands_exports = {};
__export(commands_exports, {
  add: () => add_exports,
  play: () => play_exports
});

// src/commands/add.ts
var add_exports = {};
__export(add_exports, {
  command: () => command,
  run: () => run
});
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus
} from "../node_modules/@discordjs/voice/dist/index.mjs";
import ytdl from "../node_modules/ytdl-core/lib/index.js";
import { createFFmpeg, fetchFile } from "../node_modules/@ffmpeg/ffmpeg/src/index.js";
import { Duplex } from "stream";
import { MessageActionRow } from "../node_modules/discord.js/src/index.js";
import { MessageButton } from "../node_modules/discord.js/src/index.js";
var ffmpeg = createFFmpeg({ log: false });
var command = {
  name: "add",
  description: "Add a meme",
  options: [
    {
      name: "url",
      description: "Video url",
      type: 3,
      required: true
    },
    {
      name: "start",
      description: "Start time",
      type: 3,
      required: true
    },
    {
      name: "end",
      description: "End time",
      type: 3,
      required: true
    },
    {
      name: "name",
      description: "Name",
      type: 3,
      required: true
    }
  ]
};
async function run(interaction) {
  if (interaction.isCommand()) {
    await runCommand(interaction);
  } else if (interaction.isButton()) {
    await runButton(interaction);
  }
}
async function runCommand(interaction) {
  if (!("voice" in interaction.member) || !interaction.member.voice.channel) {
    return await interaction.reply("Must be connected to voice channel");
  }
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
  const url = interaction.options.getString("url");
  const start = interaction.options.getString("start");
  const end = interaction.options.getString("end");
  const player = createAudioPlayer();
  player.on("error", (error) => {
    console.error("Error:", error.message, "with track", error.resource);
  });
  let info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: (format2) => format2.codecs === "opus" && format2.container === "webm"
  });
  ffmpeg.FS("writeFile", "meme.webm", await fetchFile(format.url));
  await ffmpeg.run("-ss", start, "-to", end, "-i", "meme.webm", "temp.webm");
  let stream = new Duplex();
  stream.push(ffmpeg.FS("readFile", "temp.webm"));
  stream.push(null);
  const resource = createAudioResource(stream, {
    inputType: StreamType.WebmOpus
  });
  const channel = interaction.member.voice.channel;
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: primaryGuildId,
    adapterCreator: channel.guild.voiceAdapterCreator
  });
  const subscription = connection.subscribe(player);
  player.play(resource);
  player.on(AudioPlayerStatus.Idle, () => {
    subscription.unsubscribe();
    connection.destroy();
  });
  const row = new MessageActionRow().addComponents(new MessageButton().setCustomId("save").setLabel("Save").setStyle("SUCCESS"), new MessageButton().setCustomId("skip").setLabel("Skip").setStyle("SECONDARY"));
  await interaction.reply({
    content: "Do you want to keep this meme?",
    components: [row],
    ephemeral: true
  });
}
async function runButton(interaction) {
}

// src/commands/play.ts
var play_exports = {};
__export(play_exports, {
  command: () => command2,
  run: () => run2
});
var command2 = {
  name: "play",
  description: "Play a meme"
};
async function run2(interation) {
}

// src/index.ts
var client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]
});
var commandData = Object.values(commands_exports).map((mod) => mod.command);
var runners = Object.values(commands_exports).reduce((acc, mod) => {
  acc[mod.command.name] = mod.run;
  return acc;
}, {});
client.once("ready", async () => {
  console.log("Ready!");
  const primaryGuild = await client.guilds.fetch(primaryGuildId);
  primaryGuild.commands.set(commandData);
});
client.on("interactionCreate", async (interaction) => {
  if (interaction.isApplicationCommand()) {
    await runners[interaction.commandName](interaction);
  }
});
client.login(token);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL2NvbmZpZy5qcyIsICIuLi9zcmMvY29tbWFuZHMvaW5kZXgudHMiLCAiLi4vc3JjL2NvbW1hbmRzL2FkZC50cyIsICIuLi9zcmMvY29tbWFuZHMvcGxheS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQ2xpZW50LCBJbnRlbnRzIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IHRva2VuLCBwcmltYXJ5R3VpbGRJZCB9IGZyb20gXCIuLi9jb25maWcuanNcIjtcbmltcG9ydCAqIGFzIGNvbW1hbmRzIGZyb20gXCIuL2NvbW1hbmRzXCI7XG5cbmNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoe1xuICBpbnRlbnRzOiBbSW50ZW50cy5GTEFHUy5HVUlMRFMsIEludGVudHMuRkxBR1MuR1VJTERfVk9JQ0VfU1RBVEVTXSxcbn0pO1xuXG5jb25zdCBjb21tYW5kRGF0YSA9IE9iamVjdC52YWx1ZXMoY29tbWFuZHMpLm1hcCgobW9kKSA9PiBtb2QuY29tbWFuZCk7XG5jb25zdCBydW5uZXJzID0gT2JqZWN0LnZhbHVlcyhjb21tYW5kcykucmVkdWNlKChhY2MsIG1vZCkgPT4ge1xuICBhY2NbbW9kLmNvbW1hbmQubmFtZV0gPSBtb2QucnVuO1xuICByZXR1cm4gYWNjO1xufSwge30pO1xuXG5jbGllbnQub25jZShcInJlYWR5XCIsIGFzeW5jICgpID0+IHtcbiAgY29uc29sZS5sb2coXCJSZWFkeSFcIik7XG4gIGNvbnN0IHByaW1hcnlHdWlsZCA9IGF3YWl0IGNsaWVudC5ndWlsZHMuZmV0Y2gocHJpbWFyeUd1aWxkSWQpO1xuICBwcmltYXJ5R3VpbGQuY29tbWFuZHMuc2V0KGNvbW1hbmREYXRhKTtcbn0pO1xuXG5jbGllbnQub24oXCJpbnRlcmFjdGlvbkNyZWF0ZVwiLCBhc3luYyAoaW50ZXJhY3Rpb24pID0+IHtcbiAgaWYgKGludGVyYWN0aW9uLmlzQXBwbGljYXRpb25Db21tYW5kKCkpIHtcbiAgICBhd2FpdCBydW5uZXJzW2ludGVyYWN0aW9uLmNvbW1hbmROYW1lXShpbnRlcmFjdGlvbik7XG4gIH1cbn0pO1xuXG5jbGllbnQubG9naW4odG9rZW4pO1xuIiwgImV4cG9ydCBjb25zdCB0b2tlbiA9XG4gIFwiT1RNNE9EQXdNVEkwTkRZek9ERXlOamN4Lllmdmp2dy5jMi1MSVF6c3BsdHdmVXMyeGlYYi03MV84N0lcIjtcbmV4cG9ydCBjb25zdCBwcmltYXJ5R3VpbGRJZCA9IFwiMjEzNDg0NTYxMTI3MDQ3MTY4XCI7XG4iLCAiZXhwb3J0ICogYXMgYWRkIGZyb20gXCIuL2FkZFwiO1xuZXhwb3J0ICogYXMgcGxheSBmcm9tIFwiLi9wbGF5XCI7XG4iLCAiaW1wb3J0IHsgQ29tbWFuZEludGVyYWN0aW9uIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IEFwcGxpY2F0aW9uQ29tbWFuZERhdGEgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHtcbiAgam9pblZvaWNlQ2hhbm5lbCxcbiAgY3JlYXRlQXVkaW9QbGF5ZXIsXG4gIGdldFZvaWNlQ29ubmVjdGlvbixcbiAgY3JlYXRlQXVkaW9SZXNvdXJjZSxcbiAgU3RyZWFtVHlwZSxcbiAgQXVkaW9QbGF5ZXJTdGF0dXMsXG4gIE5vU3Vic2NyaWJlckJlaGF2aW9yLFxufSBmcm9tIFwiQGRpc2NvcmRqcy92b2ljZVwiO1xuaW1wb3J0IHsgcHJpbWFyeUd1aWxkSWQgfSBmcm9tIFwiLi4vLi4vY29uZmlnLmpzXCI7XG5pbXBvcnQgeXRkbCBmcm9tIFwieXRkbC1jb3JlXCI7XG5pbXBvcnQgeyBjcmVhdGVGRm1wZWcsIGZldGNoRmlsZSB9IGZyb20gXCJAZmZtcGVnL2ZmbXBlZ1wiO1xuaW1wb3J0IHsgRHVwbGV4IH0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHsgTWVzc2FnZUFjdGlvblJvdyB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBNZXNzYWdlQnV0dG9uIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IEJhc2VDb21tYW5kSW50ZXJhY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgQnV0dG9uSW50ZXJhY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuXG5jb25zdCBmZm1wZWcgPSBjcmVhdGVGRm1wZWcoeyBsb2c6IGZhbHNlIH0pO1xuXG5leHBvcnQgY29uc3QgY29tbWFuZDogQXBwbGljYXRpb25Db21tYW5kRGF0YSA9IHtcbiAgbmFtZTogXCJhZGRcIixcbiAgZGVzY3JpcHRpb246IFwiQWRkIGEgbWVtZVwiLFxuICBvcHRpb25zOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJ1cmxcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlZpZGVvIHVybFwiLFxuICAgICAgdHlwZTogMyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJzdGFydFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiU3RhcnQgdGltZVwiLFxuICAgICAgdHlwZTogMyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJlbmRcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuZCB0aW1lXCIsXG4gICAgICB0eXBlOiAzLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcIm5hbWVcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk5hbWVcIixcbiAgICAgIHR5cGU6IDMsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICBdLFxufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bihpbnRlcmFjdGlvbjogQmFzZUNvbW1hbmRJbnRlcmFjdGlvbikge1xuICBpZiAoaW50ZXJhY3Rpb24uaXNDb21tYW5kKCkpIHtcbiAgICBhd2FpdCBydW5Db21tYW5kKGludGVyYWN0aW9uKTtcbiAgfSBlbHNlIGlmIChpbnRlcmFjdGlvbi5pc0J1dHRvbigpKSB7XG4gICAgYXdhaXQgcnVuQnV0dG9uKGludGVyYWN0aW9uKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5Db21tYW5kKGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24pIHtcbiAgaWYgKCEoXCJ2b2ljZVwiIGluIGludGVyYWN0aW9uLm1lbWJlcikgfHwgIWludGVyYWN0aW9uLm1lbWJlci52b2ljZS5jaGFubmVsKSB7XG4gICAgcmV0dXJuIGF3YWl0IGludGVyYWN0aW9uLnJlcGx5KFwiTXVzdCBiZSBjb25uZWN0ZWQgdG8gdm9pY2UgY2hhbm5lbFwiKTtcbiAgfVxuXG4gIGlmICghZmZtcGVnLmlzTG9hZGVkKCkpIHtcbiAgICBhd2FpdCBmZm1wZWcubG9hZCgpO1xuICB9XG5cbiAgY29uc3QgdXJsID0gaW50ZXJhY3Rpb24ub3B0aW9ucy5nZXRTdHJpbmcoXCJ1cmxcIik7XG4gIGNvbnN0IHN0YXJ0ID0gaW50ZXJhY3Rpb24ub3B0aW9ucy5nZXRTdHJpbmcoXCJzdGFydFwiKTtcbiAgY29uc3QgZW5kID0gaW50ZXJhY3Rpb24ub3B0aW9ucy5nZXRTdHJpbmcoXCJlbmRcIik7XG5cbiAgY29uc3QgcGxheWVyID0gY3JlYXRlQXVkaW9QbGF5ZXIoKTtcbiAgcGxheWVyLm9uKFwiZXJyb3JcIiwgKGVycm9yKSA9PiB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yOlwiLCBlcnJvci5tZXNzYWdlLCBcIndpdGggdHJhY2tcIiwgZXJyb3IucmVzb3VyY2UpO1xuICB9KTtcblxuICBsZXQgaW5mbyA9IGF3YWl0IHl0ZGwuZ2V0SW5mbyh1cmwpO1xuICBjb25zdCBmb3JtYXQgPSB5dGRsLmNob29zZUZvcm1hdChpbmZvLmZvcm1hdHMsIHtcbiAgICBxdWFsaXR5OiBcImhpZ2hlc3RhdWRpb1wiLFxuICAgIGZpbHRlcjogKGZvcm1hdCkgPT4gZm9ybWF0LmNvZGVjcyA9PT0gXCJvcHVzXCIgJiYgZm9ybWF0LmNvbnRhaW5lciA9PT0gXCJ3ZWJtXCIsXG4gIH0pO1xuICBmZm1wZWcuRlMoXCJ3cml0ZUZpbGVcIiwgXCJtZW1lLndlYm1cIiwgYXdhaXQgZmV0Y2hGaWxlKGZvcm1hdC51cmwpKTtcbiAgYXdhaXQgZmZtcGVnLnJ1bihcIi1zc1wiLCBzdGFydCwgXCItdG9cIiwgZW5kLCBcIi1pXCIsIFwibWVtZS53ZWJtXCIsIFwidGVtcC53ZWJtXCIpO1xuICBsZXQgc3RyZWFtID0gbmV3IER1cGxleCgpO1xuICBzdHJlYW0ucHVzaChmZm1wZWcuRlMoXCJyZWFkRmlsZVwiLCBcInRlbXAud2VibVwiKSk7XG4gIHN0cmVhbS5wdXNoKG51bGwpO1xuICBjb25zdCByZXNvdXJjZSA9IGNyZWF0ZUF1ZGlvUmVzb3VyY2Uoc3RyZWFtLCB7XG4gICAgaW5wdXRUeXBlOiBTdHJlYW1UeXBlLldlYm1PcHVzLFxuICB9KTtcblxuICBjb25zdCBjaGFubmVsID0gaW50ZXJhY3Rpb24ubWVtYmVyLnZvaWNlLmNoYW5uZWw7XG4gIGNvbnN0IGNvbm5lY3Rpb24gPSBqb2luVm9pY2VDaGFubmVsKHtcbiAgICBjaGFubmVsSWQ6IGNoYW5uZWwuaWQsXG4gICAgZ3VpbGRJZDogcHJpbWFyeUd1aWxkSWQsXG4gICAgYWRhcHRlckNyZWF0b3I6IGNoYW5uZWwuZ3VpbGQudm9pY2VBZGFwdGVyQ3JlYXRvcixcbiAgfSk7XG5cbiAgY29uc3Qgc3Vic2NyaXB0aW9uID0gY29ubmVjdGlvbi5zdWJzY3JpYmUocGxheWVyKTtcbiAgcGxheWVyLnBsYXkocmVzb3VyY2UpO1xuXG4gIHBsYXllci5vbihBdWRpb1BsYXllclN0YXR1cy5JZGxlLCAoKSA9PiB7XG4gICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgY29ubmVjdGlvbi5kZXN0cm95KCk7XG4gIH0pO1xuXG4gIGNvbnN0IHJvdyA9IG5ldyBNZXNzYWdlQWN0aW9uUm93KCkuYWRkQ29tcG9uZW50cyhcbiAgICBuZXcgTWVzc2FnZUJ1dHRvbigpXG4gICAgICAuc2V0Q3VzdG9tSWQoXCJzYXZlXCIpXG4gICAgICAuc2V0TGFiZWwoXCJTYXZlXCIpXG4gICAgICAuc2V0U3R5bGUoXCJTVUNDRVNTXCIpLFxuICAgIG5ldyBNZXNzYWdlQnV0dG9uKClcbiAgICAgIC5zZXRDdXN0b21JZChcInNraXBcIilcbiAgICAgIC5zZXRMYWJlbChcIlNraXBcIilcbiAgICAgIC5zZXRTdHlsZShcIlNFQ09OREFSWVwiKVxuICApO1xuICBhd2FpdCBpbnRlcmFjdGlvbi5yZXBseSh7XG4gICAgY29udGVudDogXCJEbyB5b3Ugd2FudCB0byBrZWVwIHRoaXMgbWVtZT9cIixcbiAgICBjb21wb25lbnRzOiBbcm93XSxcbiAgICBlcGhlbWVyYWw6IHRydWUsXG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBydW5CdXR0b24oaW50ZXJhY3Rpb246IEJ1dHRvbkludGVyYWN0aW9uKSB7fVxuIiwgImltcG9ydCB7IEFwcGxpY2F0aW9uQ29tbWFuZERhdGEgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuXG5leHBvcnQgY29uc3QgY29tbWFuZDogQXBwbGljYXRpb25Db21tYW5kRGF0YSA9IHtcbiAgbmFtZTogXCJwbGF5XCIsXG4gIGRlc2NyaXB0aW9uOiBcIlBsYXkgYSBtZW1lXCIsXG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuKGludGVyYXRpb24pIHt9XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7OztBQ0FPLElBQU0sUUFDWDtBQUNLLElBQU0saUJBQWlCOzs7QUNGOUI7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBLElBQU0sU0FBUyxhQUFhLEVBQUUsS0FBSztBQUU1QixJQUFNLFVBQWtDO0FBQUEsRUFDN0MsTUFBTTtBQUFBLEVBQ04sYUFBYTtBQUFBLEVBQ2IsU0FBUztBQUFBLElBQ1A7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGFBQWE7QUFBQSxNQUNiLE1BQU07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
