
import { Client, GatewayIntentBits } from 'discord.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// 1. Load environment variables
dotenv.config();

// 2. Configure the required intents for the bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// 3. Initialize the Google Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Retrieve the security log channel ID from the .env file
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

client.once('ready', () => {
  console.log(`GuardX is online and logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // Ignore messages sent by bots
  if (message.author.bot) return;

  const text = message.content;

  try {
    // Feature 1: If a user types '!ai', generate a response using Gemini
    if (text.startsWith('!ai ')) {
      const query = text.replace('!ai ', '');

      const aiAnswer = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
      });

      await message.reply(aiAnswer.text);
      return;
    }

    // Feature 2: Scan all other messages for potential security risks
    const prompt = `Analyze this chat message for security risks, leaked API keys, passwords, or sensitive data.
    If it looks safe, reply with only "SAFE".
    If it contains a leak or risk, reply starting with "WARNING:".
    Message: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const analysis = response.text.trim();

    // If Gemini detects a potential security threat or leaked information
    if (analysis.startsWith('WARNING')) {
      // Send a security warning to the user in the public channel
      await message.reply(`🚨 **SECURITY ALERT:** Hey <@${message.author.id}>, your message looks like it contains sensitive data or a secret key!`);

      // If a log channel ID is configured, send an audit report there
      if (LOG_CHANNEL_ID) {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);

        if (logChannel) {
          await logChannel.send(
            ` **AUDIT LOG REPORT**\n` +
            `• **User:** <@${message.author.id}> (${message.author.tag})\n` +
            `• **Channel:** <#${message.channel.id}>\n` +
            `• **Leaked Message:** \`\`\`${text}\`\`\``
          );
        }
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

// Log in to Discord using the bot token
client.login(process.env.DISCORD_TOKEN);
