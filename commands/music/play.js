const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const playdl = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption(o => o.setName('query').setDescription('Song name or YouTube URL').setRequired(true)),

  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You need to be in a voice channel first!', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      // Search for the song
      let songInfo;
      if (playdl.yt_validate(query) === 'video') {
        const info = await playdl.video_info(query);
        songInfo = { title: info.video_details.title, url: info.video_details.url, duration: info.video_details.durationInSec };
      } else {
        const results = await playdl.search(query, { limit: 1 });
        if (!results.length) return interaction.editReply('❌ No results found.');
        songInfo = { title: results[0].title, url: results[0].url, duration: results[0].durationInSec };
      }

      // Get or create queue
      let queue = client.musicQueues.get(interaction.guild.id);

      if (!queue) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        connection.subscribe(player);

        queue = { connection, player, songs: [], volume: 100, playing: false };
        client.musicQueues.set(interaction.guild.id, queue);

        // Handle disconnect
        connection.on(VoiceConnectionStatus.Disconnected, () => {
          client.musicQueues.delete(interaction.guild.id);
        });

        // Auto-play next song
        player.on(AudioPlayerStatus.Idle, () => {
          queue.songs.shift();
          if (queue.songs.length > 0) {
            playSong(queue, client, interaction.guild.id);
          } else {
            queue.playing = false;
          }
        });
      }

      queue.songs.push(songInfo);

      if (!queue.playing) {
        playSong(queue, client, interaction.guild.id);
      }

      const mins = Math.floor(songInfo.duration / 60);
      const secs = String(songInfo.duration % 60).padStart(2, '0');

      const embed = {
        color: 0x6C63FF,
        title: queue.playing ? '📋 Added to Queue' : '🎵 Now Playing',
        description: `**[${songInfo.title}](${songInfo.url})**`,
        fields: [
          { name: '⏱️ Duration', value: `${mins}:${secs}`, inline: true },
          { name: '📊 Queue Position', value: queue.playing ? `#${queue.songs.length}` : '#1', inline: true },
        ],
        footer: { text: `Requested by ${interaction.user.tag}` },
        timestamp: new Date().toISOString()
      };

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error('Play error:', err);
      await interaction.editReply(`❌ Error: ${err.message}`);
    }
  }
};

async function playSong(queue, client, guildId) {
  if (!queue.songs.length) return;
  queue.playing = true;

  const song = queue.songs[0];
  try {
    const stream = await playdl.stream(song.url, { quality: 2 });
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    queue.player.play(resource);
  } catch (err) {
    console.error('Stream error:', err);
    queue.songs.shift();
    if (queue.songs.length) playSong(queue, client, guildId);
  }
}
