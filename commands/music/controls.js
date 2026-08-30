const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Music controls')
    .addSubcommand(s => s.setName('skip').setDescription('Skip the current song'))
    .addSubcommand(s => s.setName('stop').setDescription('Stop music and leave voice channel'))
    .addSubcommand(s => s.setName('pause').setDescription('Pause the current song'))
    .addSubcommand(s => s.setName('resume').setDescription('Resume the current song'))
    .addSubcommand(s => s.setName('queue').setDescription('Show the music queue'))
    .addSubcommand(s => s.setName('nowplaying').setDescription('Show current song'))
    .addSubcommand(s => s
      .setName('volume')
      .setDescription('Set the volume')
      .addIntegerOption(o => o.setName('level').setDescription('Volume (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const queue = client.musicQueues.get(interaction.guild.id);

    if (!queue && sub !== 'queue') {
      return interaction.reply({ content: '❌ No music is playing right now.', ephemeral: true });
    }

    switch (sub) {

      case 'skip': {
        queue.player.stop();
        await interaction.reply('⏭️ Skipped the current song.');
        break;
      }

      case 'stop': {
        queue.songs = [];
        queue.player.stop();
        queue.connection.destroy();
        client.musicQueues.delete(interaction.guild.id);
        await interaction.reply('⏹️ Stopped music and left the voice channel.');
        break;
      }

      case 'pause': {
        if (queue.player.state.status !== AudioPlayerStatus.Playing) {
          return interaction.reply({ content: '❌ Nothing is playing.', ephemeral: true });
        }
        queue.player.pause();
        await interaction.reply('⏸️ Paused.');
        break;
      }

      case 'resume': {
        if (queue.player.state.status !== AudioPlayerStatus.Paused) {
          return interaction.reply({ content: '❌ Music is not paused.', ephemeral: true });
        }
        queue.player.unpause();
        await interaction.reply('▶️ Resumed.');
        break;
      }

      case 'queue': {
        if (!queue || !queue.songs.length) {
          return interaction.reply({ content: '📋 The queue is empty.', ephemeral: true });
        }
        const list = queue.songs.map((s, i) =>
          `${i === 0 ? '▶️' : `${i}.`} **${s.title}**`
        ).slice(0, 10).join('\n');

        const embed = {
          color: 0x6C63FF,
          title: '🎵 Music Queue',
          description: list,
          footer: { text: `${queue.songs.length} song(s) in queue` }
        };
        await interaction.reply({ embeds: [embed] });
        break;
      }

      case 'nowplaying': {
        const song = queue.songs[0];
        if (!song) return interaction.reply({ content: '❌ Nothing playing.', ephemeral: true });
        const embed = {
          color: 0x6C63FF,
          title: '🎵 Now Playing',
          description: `**[${song.title}](${song.url})**`,
          timestamp: new Date().toISOString()
        };
        await interaction.reply({ embeds: [embed] });
        break;
      }

      case 'volume': {
        const level = interaction.options.getInteger('level');
        queue.volume = level;
        await interaction.reply(`🔊 Volume set to **${level}%**`);
        break;
      }
    }
  }
};
