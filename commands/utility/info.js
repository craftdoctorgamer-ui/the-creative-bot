const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information')
    .addSubcommand(s => s.setName('server').setDescription('Show server information'))
    .addSubcommand(s => s.setName('user').setDescription('Show user information')
      .addUserOption(o => o.setName('target').setDescription('User to look up').setRequired(false))
    )
    .addSubcommand(s => s.setName('ping').setDescription('Check bot latency')),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {

      case 'server': {
        const guild = interaction.guild;
        await guild.members.fetch();

        const embed = {
          color: 0x6C63FF,
          title: guild.name,
          thumbnail: { url: guild.iconURL() || '' },
          fields: [
            { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
            { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
            { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
          ],
          footer: { text: `ID: ${guild.id}` },
          timestamp: new Date().toISOString()
        };

        await interaction.reply({ embeds: [embed] });
        break;
      }

      case 'user': {
        const target = interaction.options.getUser('target') || interaction.user;
        const member = interaction.guild.members.cache.get(target.id);

        const embed = {
          color: 0x6C63FF,
          title: target.tag,
          thumbnail: { url: target.displayAvatarURL() },
          fields: [
            { name: '🆔 ID', value: target.id, inline: true },
            { name: '📅 Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`, inline: true },
            { name: '📥 Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'N/A', inline: true },
            { name: '🎭 Top Role', value: member?.roles.highest.toString() || 'N/A', inline: true },
            { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true },
          ],
          timestamp: new Date().toISOString()
        };

        await interaction.reply({ embeds: [embed] });
        break;
      }

      case 'ping': {
        const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embed = {
          color: latency < 100 ? 0x00D084 : latency < 250 ? 0xFFB800 : 0xFF4D00,
          title: '🏓 Pong!',
          fields: [
            { name: '⚡ Bot Latency', value: `${latency}ms`, inline: true },
            { name: '📡 API Latency', value: `${apiLatency}ms`, inline: true },
          ],
          timestamp: new Date().toISOString()
        };

        await interaction.editReply({ content: '', embeds: [embed] });
        break;
      }
    }
  }
};
