const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete multiple messages at once')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    try {
      await interaction.deferReply({ ephemeral: true });
      const deleted = await interaction.channel.bulkDelete(amount, true);

      await interaction.editReply({
        content: `✅ Successfully deleted **${deleted.size}** message(s).`
      });
    } catch (err) {
      await interaction.editReply({ content: `❌ Failed to delete messages: ${err.message}` });
    }
  }
};
