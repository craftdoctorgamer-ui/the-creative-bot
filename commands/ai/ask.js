const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the AI assistant anything')
    .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('question');

    await interaction.deferReply();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          system: `You are a helpful, smart Discord bot assistant. Keep answers concise and Discord-friendly (under 1800 characters). Use markdown formatting when it helps clarity.`,
          messages: [{ role: 'user', content: question }]
        })
      });

      const data = await response.json();
      const answer = data.content?.[0]?.text || 'Sorry, no response generated.';

      const embed = {
        color: 0x6C63FF,
        fields: [
          { name: '❓ Question', value: question },
          { name: '🤖 Answer', value: answer.length > 1024 ? answer.slice(0, 1021) + '...' : answer }
        ],
        footer: { text: `Asked by ${interaction.user.tag} · Powered by Claude` },
        timestamp: new Date().toISOString()
      };

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      await interaction.editReply('❌ AI is temporarily unavailable. Try again later!');
    }
  }
};
