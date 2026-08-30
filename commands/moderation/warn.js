const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// In-memory warn storage (resets on bot restart)
// For persistent warns, replace with a JSON file or database
const warns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    if (!target) return interaction.reply({ content: '❌ User not found.', ephemeral: true });

    const key = `${interaction.guild.id}-${target.id}`;
    const userWarns = warns.get(key) || [];
    userWarns.push({ reason, by: interaction.user.tag, date: new Date().toISOString() });
    warns.set(key, userWarns);

    try {
      await target.send(`⚠️ You have been **warned** in **${interaction.guild.name}**.\n**Reason:** ${reason}\n**Total warnings:** ${userWarns.length}`).catch(() => {});
    } catch {}

    const embed = {
      color: 0xFFB800,
      title: '⚠️ Member Warned',
      fields: [
        { name: 'User', value: `${target.user.tag}`, inline: true },
        { name: 'Total Warns', value: `${userWarns.length}`, inline: true },
        { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
        { name: 'Reason', value: reason }
      ],
      timestamp: new Date().toISOString()
    };

    await interaction.reply({ embeds: [embed] });
  },

  // Export warns map so /warnings command can access it
  warns
};
