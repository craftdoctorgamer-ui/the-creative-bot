const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.reply({ content: '❌ User not found.', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '❌ I cannot kick this user.', ephemeral: true });

    try {
      await target.send(`👢 You have been **kicked** from **${interaction.guild.name}**.\n**Reason:** ${reason}`).catch(() => {});
      await target.kick(`${reason} | By: ${interaction.user.tag}`);

      const embed = {
        color: 0xFFB800,
        title: '👢 Member Kicked',
        fields: [
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason }
        ],
        timestamp: new Date().toISOString()
      };

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ Failed to kick: ${err.message}`, ephemeral: true });
    }
  }
};
