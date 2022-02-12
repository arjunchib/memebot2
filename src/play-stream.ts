import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
} from "@discordjs/voice";

export function playStream(interaction, stream) {
  const player = createAudioPlayer();

  player.on("error", console.error);

  const resource = createAudioResource(stream, {
    inputType: StreamType.WebmOpus,
  });

  const channel = interaction.member.voice.channel;
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: interaction.member.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  const subscription = connection.subscribe(player);
  player.play(resource);

  player.on(AudioPlayerStatus.Idle, () => {
    subscription.unsubscribe();
    connection.destroy();
  });
}
