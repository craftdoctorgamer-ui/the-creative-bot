require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ===== Client Setup =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ]
});

client.commands = new Collection();
client.musicQueues = new Map(); // guild music queues

// ===== Load Commands =====
const commandFolders = ['moderation', 'music', 'ai', 'utility'];

const allCommands = [];

for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(folderPath)) continue;
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      allCommands.push(command.data.toJSON());
    }
  }
}

// ===== Register Slash Commands =====
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log('📡 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: allCommands }
    );
    console.log(`✅ Registered ${allCommands.length} slash commands globally.`);
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
}

// ===== Events =====
client.once('ready', async () => {
  console.log(`\n🤖 ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);

  client.user.setActivity('your server 👀', { type: ActivityType.Watching });

  await registerCommands();
});

// ===== Slash Command Handler =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`❌ Error in /${interaction.commandName}:`, err);
    const msg = { content: '❌ Something went wrong while running this command.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

// ===== Message Handler (AI replies) =====
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const aiChannelId = process.env.AI_CHANNEL_ID;
  const isMentioned = message.mentions.has(client.user);
  const isAIChannel = aiChannelId && message.channel.id === aiChannelId;

  if (!isMentioned && !isAIChannel) return;

  // Remove mention from message
  const content = message.content
    .replace(`<@${client.user.id}>`, '')
    .replace(`<@!${client.user.id}>`, '')
    .trim();

  if (!content) {
    return message.reply('Hey! What can I help you with? 👋');
  }

  try {
    await message.channel.sendTyping();

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
        system: `You are a helpful, friendly Discord bot assistant. 
Keep your answers concise and Discord-friendly (under 1800 characters). 
Use Discord markdown (bold, italic, code blocks) when helpful.
You're serving a community server — be welcoming and helpful.`,
        messages: [{ role: 'user', content }]
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I couldn\'t generate a response.';

    // Split if too long
    if (reply.length > 1900) {
      const chunks = reply.match(/.{1,1900}/gs) || [];
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(reply);
    }

  } catch (err) {
    console.error('AI reply error:', err);
    await message.reply('❌ AI is temporarily unavailable. Try again later!');
  }
});

// ===== Guild Join: Send Welcome =====
client.on('guildMemberAdd', async member => {
  const channel = member.guild.systemChannel;
  if (!channel) return;

  const embed = {
    color: 0x6C63FF,
    title: `👋 Welcome to ${member.guild.name}!`,
    description: `Hey ${member}, glad you're here!\nYou're member **#${member.guild.memberCount}**.\n\nCheck the rules and enjoy your stay! 🎉`,
    thumbnail: { url: member.user.displayAvatarURL() },
    timestamp: new Date().toISOString(),
    footer: { text: member.guild.name }
  };

  channel.send({ embeds: [embed] });
});

// ===== Login =====
client.login(process.env.DISCORD_TOKEN);
