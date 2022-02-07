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
    }
  ]
};
async function run(interaction) {
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
  const row = new MessageActionRow().addComponents(new MessageButton().setCustomId("keep").setLabel("Keep").setStyle("PRIMARY"), new MessageButton().setCustomId("delete").setLabel("Delete").setStyle("DANGER"));
  await interaction.reply({
    content: "Do you want to keep this meme?",
    components: [row],
    ephemeral: true
  });
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
  if (interaction.isCommand()) {
    await runners[interaction.commandName](interaction);
  }
});
client.login(token);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIiwgIi4uL2NvbmZpZy5qcyIsICIuLi9zcmMvY29tbWFuZHMvaW5kZXgudHMiLCAiLi4vc3JjL2NvbW1hbmRzL2FkZC50cyIsICIuLi9zcmMvY29tbWFuZHMvcGxheS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgQ2xpZW50LCBJbnRlbnRzIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IHRva2VuLCBwcmltYXJ5R3VpbGRJZCB9IGZyb20gXCIuLi9jb25maWcuanNcIjtcbmltcG9ydCAqIGFzIGNvbW1hbmRzIGZyb20gXCIuL2NvbW1hbmRzXCI7XG5cbmNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoe1xuICBpbnRlbnRzOiBbSW50ZW50cy5GTEFHUy5HVUlMRFMsIEludGVudHMuRkxBR1MuR1VJTERfVk9JQ0VfU1RBVEVTXSxcbn0pO1xuXG5jb25zdCBjb21tYW5kRGF0YSA9IE9iamVjdC52YWx1ZXMoY29tbWFuZHMpLm1hcCgobW9kKSA9PiBtb2QuY29tbWFuZCk7XG5jb25zdCBydW5uZXJzID0gT2JqZWN0LnZhbHVlcyhjb21tYW5kcykucmVkdWNlKChhY2MsIG1vZCkgPT4ge1xuICBhY2NbbW9kLmNvbW1hbmQubmFtZV0gPSBtb2QucnVuO1xuICByZXR1cm4gYWNjO1xufSwge30pO1xuXG5jbGllbnQub25jZShcInJlYWR5XCIsIGFzeW5jICgpID0+IHtcbiAgY29uc29sZS5sb2coXCJSZWFkeSFcIik7XG4gIGNvbnN0IHByaW1hcnlHdWlsZCA9IGF3YWl0IGNsaWVudC5ndWlsZHMuZmV0Y2gocHJpbWFyeUd1aWxkSWQpO1xuICBwcmltYXJ5R3VpbGQuY29tbWFuZHMuc2V0KGNvbW1hbmREYXRhKTtcbn0pO1xuXG5jbGllbnQub24oXCJpbnRlcmFjdGlvbkNyZWF0ZVwiLCBhc3luYyAoaW50ZXJhY3Rpb24pID0+IHtcbiAgaWYgKGludGVyYWN0aW9uLmlzQ29tbWFuZCgpKSB7XG4gICAgYXdhaXQgcnVubmVyc1tpbnRlcmFjdGlvbi5jb21tYW5kTmFtZV0oaW50ZXJhY3Rpb24pO1xuICB9XG59KTtcblxuY2xpZW50LmxvZ2luKHRva2VuKTtcbiIsICJleHBvcnQgY29uc3QgdG9rZW4gPVxuICBcIk9UTTRPREF3TVRJME5EWXpPREV5TmpjeC5ZZnZqdncuYzItTElRenNwbHR3ZlVzMnhpWGItNzFfODdJXCI7XG5leHBvcnQgY29uc3QgcHJpbWFyeUd1aWxkSWQgPSBcIjIxMzQ4NDU2MTEyNzA0NzE2OFwiO1xuIiwgImV4cG9ydCAqIGFzIGFkZCBmcm9tIFwiLi9hZGRcIjtcbmV4cG9ydCAqIGFzIHBsYXkgZnJvbSBcIi4vcGxheVwiO1xuIiwgImltcG9ydCB7IENvbW1hbmRJbnRlcmFjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBBcHBsaWNhdGlvbkNvbW1hbmREYXRhIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7XG4gIGpvaW5Wb2ljZUNoYW5uZWwsXG4gIGNyZWF0ZUF1ZGlvUGxheWVyLFxuICBnZXRWb2ljZUNvbm5lY3Rpb24sXG4gIGNyZWF0ZUF1ZGlvUmVzb3VyY2UsXG4gIFN0cmVhbVR5cGUsXG4gIEF1ZGlvUGxheWVyU3RhdHVzLFxuICBOb1N1YnNjcmliZXJCZWhhdmlvcixcbn0gZnJvbSBcIkBkaXNjb3JkanMvdm9pY2VcIjtcbmltcG9ydCB7IHByaW1hcnlHdWlsZElkIH0gZnJvbSBcIi4uLy4uL2NvbmZpZy5qc1wiO1xuaW1wb3J0IHl0ZGwgZnJvbSBcInl0ZGwtY29yZVwiO1xuaW1wb3J0IHsgY3JlYXRlRkZtcGVnLCBmZXRjaEZpbGUgfSBmcm9tIFwiQGZmbXBlZy9mZm1wZWdcIjtcbmltcG9ydCB7IER1cGxleCB9IGZyb20gXCJzdHJlYW1cIjtcbmltcG9ydCB7IE1lc3NhZ2VBY3Rpb25Sb3cgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgTWVzc2FnZUJ1dHRvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5cbmNvbnN0IGZmbXBlZyA9IGNyZWF0ZUZGbXBlZyh7IGxvZzogZmFsc2UgfSk7XG5cbmV4cG9ydCBjb25zdCBjb21tYW5kOiBBcHBsaWNhdGlvbkNvbW1hbmREYXRhID0ge1xuICBuYW1lOiBcImFkZFwiLFxuICBkZXNjcmlwdGlvbjogXCJBZGQgYSBtZW1lXCIsXG4gIG9wdGlvbnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcInVybFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiVmlkZW8gdXJsXCIsXG4gICAgICB0eXBlOiAzLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcInN0YXJ0XCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJTdGFydCB0aW1lXCIsXG4gICAgICB0eXBlOiAzLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcImVuZFwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiRW5kIHRpbWVcIixcbiAgICAgIHR5cGU6IDMsXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICB9LFxuICBdLFxufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bihpbnRlcmFjdGlvbjogQ29tbWFuZEludGVyYWN0aW9uKSB7XG4gIGlmICghKFwidm9pY2VcIiBpbiBpbnRlcmFjdGlvbi5tZW1iZXIpIHx8ICFpbnRlcmFjdGlvbi5tZW1iZXIudm9pY2UuY2hhbm5lbCkge1xuICAgIHJldHVybiBhd2FpdCBpbnRlcmFjdGlvbi5yZXBseShcIk11c3QgYmUgY29ubmVjdGVkIHRvIHZvaWNlIGNoYW5uZWxcIik7XG4gIH1cblxuICBpZiAoIWZmbXBlZy5pc0xvYWRlZCgpKSB7XG4gICAgYXdhaXQgZmZtcGVnLmxvYWQoKTtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IGludGVyYWN0aW9uLm9wdGlvbnMuZ2V0U3RyaW5nKFwidXJsXCIpO1xuICBjb25zdCBzdGFydCA9IGludGVyYWN0aW9uLm9wdGlvbnMuZ2V0U3RyaW5nKFwic3RhcnRcIik7XG4gIGNvbnN0IGVuZCA9IGludGVyYWN0aW9uLm9wdGlvbnMuZ2V0U3RyaW5nKFwiZW5kXCIpO1xuXG4gIGNvbnN0IHBsYXllciA9IGNyZWF0ZUF1ZGlvUGxheWVyKCk7XG4gIHBsYXllci5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvcjpcIiwgZXJyb3IubWVzc2FnZSwgXCJ3aXRoIHRyYWNrXCIsIGVycm9yLnJlc291cmNlKTtcbiAgfSk7XG5cbiAgbGV0IGluZm8gPSBhd2FpdCB5dGRsLmdldEluZm8odXJsKTtcbiAgY29uc3QgZm9ybWF0ID0geXRkbC5jaG9vc2VGb3JtYXQoaW5mby5mb3JtYXRzLCB7XG4gICAgcXVhbGl0eTogXCJoaWdoZXN0YXVkaW9cIixcbiAgICBmaWx0ZXI6IChmb3JtYXQpID0+IGZvcm1hdC5jb2RlY3MgPT09IFwib3B1c1wiICYmIGZvcm1hdC5jb250YWluZXIgPT09IFwid2VibVwiLFxuICB9KTtcbiAgZmZtcGVnLkZTKFwid3JpdGVGaWxlXCIsIFwibWVtZS53ZWJtXCIsIGF3YWl0IGZldGNoRmlsZShmb3JtYXQudXJsKSk7XG4gIGF3YWl0IGZmbXBlZy5ydW4oXCItc3NcIiwgc3RhcnQsIFwiLXRvXCIsIGVuZCwgXCItaVwiLCBcIm1lbWUud2VibVwiLCBcInRlbXAud2VibVwiKTtcbiAgbGV0IHN0cmVhbSA9IG5ldyBEdXBsZXgoKTtcbiAgc3RyZWFtLnB1c2goZmZtcGVnLkZTKFwicmVhZEZpbGVcIiwgXCJ0ZW1wLndlYm1cIikpO1xuICBzdHJlYW0ucHVzaChudWxsKTtcbiAgY29uc3QgcmVzb3VyY2UgPSBjcmVhdGVBdWRpb1Jlc291cmNlKHN0cmVhbSwge1xuICAgIGlucHV0VHlwZTogU3RyZWFtVHlwZS5XZWJtT3B1cyxcbiAgfSk7XG5cbiAgY29uc3QgY2hhbm5lbCA9IGludGVyYWN0aW9uLm1lbWJlci52b2ljZS5jaGFubmVsO1xuICBjb25zdCBjb25uZWN0aW9uID0gam9pblZvaWNlQ2hhbm5lbCh7XG4gICAgY2hhbm5lbElkOiBjaGFubmVsLmlkLFxuICAgIGd1aWxkSWQ6IHByaW1hcnlHdWlsZElkLFxuICAgIGFkYXB0ZXJDcmVhdG9yOiBjaGFubmVsLmd1aWxkLnZvaWNlQWRhcHRlckNyZWF0b3IsXG4gIH0pO1xuXG4gIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGNvbm5lY3Rpb24uc3Vic2NyaWJlKHBsYXllcik7XG4gIHBsYXllci5wbGF5KHJlc291cmNlKTtcblxuICBwbGF5ZXIub24oQXVkaW9QbGF5ZXJTdGF0dXMuSWRsZSwgKCkgPT4ge1xuICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIGNvbm5lY3Rpb24uZGVzdHJveSgpO1xuICB9KTtcblxuICBjb25zdCByb3cgPSBuZXcgTWVzc2FnZUFjdGlvblJvdygpLmFkZENvbXBvbmVudHMoXG4gICAgbmV3IE1lc3NhZ2VCdXR0b24oKVxuICAgICAgLnNldEN1c3RvbUlkKFwia2VlcFwiKVxuICAgICAgLnNldExhYmVsKFwiS2VlcFwiKVxuICAgICAgLnNldFN0eWxlKFwiUFJJTUFSWVwiKSxcbiAgICBuZXcgTWVzc2FnZUJ1dHRvbigpXG4gICAgICAuc2V0Q3VzdG9tSWQoXCJkZWxldGVcIilcbiAgICAgIC5zZXRMYWJlbChcIkRlbGV0ZVwiKVxuICAgICAgLnNldFN0eWxlKFwiREFOR0VSXCIpXG4gICk7XG4gIGF3YWl0IGludGVyYWN0aW9uLnJlcGx5KHtcbiAgICBjb250ZW50OiBcIkRvIHlvdSB3YW50IHRvIGtlZXAgdGhpcyBtZW1lP1wiLFxuICAgIGNvbXBvbmVudHM6IFtyb3ddLFxuICAgIGVwaGVtZXJhbDogdHJ1ZSxcbiAgfSk7XG59XG4iLCAiaW1wb3J0IHsgQXBwbGljYXRpb25Db21tYW5kRGF0YSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBjb21tYW5kOiBBcHBsaWNhdGlvbkNvbW1hbmREYXRhID0ge1xuICBuYW1lOiBcInBsYXlcIixcbiAgZGVzY3JpcHRpb246IFwiUGxheSBhIG1lbWVcIixcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW4oaW50ZXJhdGlvbikge31cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7QUFBQTs7O0FDQU8sSUFBTSxRQUNYO0FBQ0ssSUFBTSxpQkFBaUI7OztBQ0Y5QjtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTSxTQUFTLGFBQWEsRUFBRSxLQUFLO0FBRTVCLElBQU0sVUFBa0M7QUFBQSxFQUM3QyxNQUFNO0FBQUEsRUFDTixhQUFhO0FBQUEsRUFDYixTQUFTO0FBQUEsSUFDUDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sYUFBYTtBQUFBLE1BQ2IsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBO0FBQUEsSUFFWjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sYUFBYTtBQUFBLE1BQ2IsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBO0FBQUEsSUFFWjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sYUFBYTtBQUFBLE1BQ2IsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUtoQixtQkFBMEIsYUFBaUM7QUFDekQsTUFBSSxDQUFFLFlBQVcsWUFBWSxXQUFXLENBQUMsWUFBWSxPQUFPLE1BQU0sU0FBUztBQUN6RSxXQUFPLE1BQU0sWUFBWSxNQUFNO0FBQUE7QUFHakMsTUFBSSxDQUFDLE9BQU8sWUFBWTtBQUN0QixVQUFNLE9BQU87QUFBQTtBQUdmLFFBQU0sTUFBTSxZQUFZLFFBQVEsVUFBVTtBQUMxQyxRQUFNLFFBQVEsWUFBWSxRQUFRLFVBQVU7QUFDNUMsUUFBTSxNQUFNLFlBQVksUUFBUSxVQUFVO0FBRTFDLFFBQU0sU0FBUztBQUNmLFNBQU8sR0FBRyxTQUFTLENBQUMsVUFBVTtBQUM1QixZQUFRLE1BQU0sVUFBVSxNQUFNLFNBQVMsY0FBYyxNQUFNO0FBQUE7QUFHN0QsTUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRO0FBQzlCLFFBQU0sU0FBUyxLQUFLLGFBQWEsS0FBSyxTQUFTO0FBQUEsSUFDN0MsU0FBUztBQUFBLElBQ1QsUUFBUSxDQUFDLFlBQVcsUUFBTyxXQUFXLFVBQVUsUUFBTyxjQUFjO0FBQUE7QUFFdkUsU0FBTyxHQUFHLGFBQWEsYUFBYSxNQUFNLFVBQVUsT0FBTztBQUMzRCxRQUFNLE9BQU8sSUFBSSxPQUFPLE9BQU8sT0FBTyxLQUFLLE1BQU0sYUFBYTtBQUM5RCxNQUFJLFNBQVMsSUFBSTtBQUNqQixTQUFPLEtBQUssT0FBTyxHQUFHLFlBQVk7QUFDbEMsU0FBTyxLQUFLO0FBQ1osUUFBTSxXQUFXLG9CQUFvQixRQUFRO0FBQUEsSUFDM0MsV0FBVyxXQUFXO0FBQUE7QUFHeEIsUUFBTSxVQUFVLFlBQVksT0FBTyxNQUFNO0FBQ3pDLFFBQU0sYUFBYSxpQkFBaUI7QUFBQSxJQUNsQyxXQUFXLFFBQVE7QUFBQSxJQUNuQixTQUFTO0FBQUEsSUFDVCxnQkFBZ0IsUUFBUSxNQUFNO0FBQUE7QUFHaEMsUUFBTSxlQUFlLFdBQVcsVUFBVTtBQUMxQyxTQUFPLEtBQUs7QUFFWixTQUFPLEdBQUcsa0JBQWtCLE1BQU0sTUFBTTtBQUN0QyxpQkFBYTtBQUNiLGVBQVc7QUFBQTtBQUdiLFFBQU0sTUFBTSxJQUFJLG1CQUFtQixjQUNqQyxJQUFJLGdCQUNELFlBQVksUUFDWixTQUFTLFFBQ1QsU0FBUyxZQUNaLElBQUksZ0JBQ0QsWUFBWSxVQUNaLFNBQVMsVUFDVCxTQUFTO0FBRWQsUUFBTSxZQUFZLE1BQU07QUFBQSxJQUN0QixTQUFTO0FBQUEsSUFDVCxZQUFZLENBQUM7QUFBQSxJQUNiLFdBQVc7QUFBQTtBQUFBOzs7QUN6R2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVPLElBQU0sV0FBa0M7QUFBQSxFQUM3QyxNQUFNO0FBQUEsRUFDTixhQUFhO0FBQUE7QUFHZixvQkFBMEIsWUFBWTtBQUFBOzs7QUpIdEMsSUFBTSxTQUFTLElBQUksT0FBTztBQUFBLEVBQ3hCLFNBQVMsQ0FBQyxRQUFRLE1BQU0sUUFBUSxRQUFRLE1BQU07QUFBQTtBQUdoRCxJQUFNLGNBQWMsT0FBTyxPQUFPLGtCQUFVLElBQUksQ0FBQyxRQUFRLElBQUk7QUFDN0QsSUFBTSxVQUFVLE9BQU8sT0FBTyxrQkFBVSxPQUFPLENBQUMsS0FBSyxRQUFRO0FBQzNELE1BQUksSUFBSSxRQUFRLFFBQVEsSUFBSTtBQUM1QixTQUFPO0FBQUEsR0FDTjtBQUVILE9BQU8sS0FBSyxTQUFTLFlBQVk7QUFDL0IsVUFBUSxJQUFJO0FBQ1osUUFBTSxlQUFlLE1BQU0sT0FBTyxPQUFPLE1BQU07QUFDL0MsZUFBYSxTQUFTLElBQUk7QUFBQTtBQUc1QixPQUFPLEdBQUcscUJBQXFCLE9BQU8sZ0JBQWdCO0FBQ3BELE1BQUksWUFBWSxhQUFhO0FBQzNCLFVBQU0sUUFBUSxZQUFZLGFBQWE7QUFBQTtBQUFBO0FBSTNDLE9BQU8sTUFBTTsiLAogICJuYW1lcyI6IFtdCn0K
