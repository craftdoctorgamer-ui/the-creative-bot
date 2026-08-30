const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    const embed = {
      color: 0x6C63FF,
      title: '🤖 Bot Commands',
      description: 'Here\'s everything I can do:',
      fields: [
        {
          name: '🛡️ Moderation',
          value: [
            '`/ban` — Ban a member',
            '`/kick` — Kick a member',
            '`/timeout` — Timeout a member',
            '`/warn` — Warn a member',
            '`/clear` — Delete messages',
          ].join('\n')
        },
        {
          name: '🎵 Music',
          value: [
            '`/play` — Play a song from YouTube',
            '`/music skip` — Skip current song',
            '`/music stop` — Stop & leave',
            '`/music pause` — Pause',
            '`/music resume` — Resume',
            '`/music queue` — Show queue',
            '`/music nowplaying` — Current song',
            '`/music volume` — Set volume',
          ].join('\n')
        },
        {
          name: '🤖 AI',
          value: [
            '`/ask` — Ask the AI anything',
            `Mention me anywhere to chat with AI`,
          ].join('\n')
        },
        {
          name: '⚙️ Utility',
          value: [
            '`/info server` — Server info',
            '`/info user` — User info',
            '`/info ping` — Check latency',
            '`/help` — Show this menu',
          ].join('\n')
        },
      ],
      footer: { text: 'Built by The Creative Studio · Powered by Claude AI' },
      timestamp: new Date().toISOString()
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
