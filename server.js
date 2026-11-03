import { Client, GatewayIntentBits } from 'discord.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// 1. Environment variables load karo
dotenv.config();

// 2. Bot ke liye Intents set karo (jo messages padhne ke liye zaroori hain)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// 3. Google Gemini API initialize karo
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// .env se security log channel ki ID uthao
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

client.once('ready', () => {
  console.log(`GuardX is online and logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // Agar message khud bot ne bheja hai, toh ignore karo
  if (message.author.bot) return;

  const text = message.content;

  try {
    // Feature 1: Agar koi '!ai' likhe, toh Gemini se jawaab lo
    if (text.startsWith('!ai ')) {
      const query = text.replace('!ai ', '');
      
      const aiAnswer = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
      });

      await message.reply(aiAnswer.text);
      return;
    }

    // Feature 2: Baaki sabhi messages ko security ke liye check karo
    const prompt = `Analyze this chat message for security risks, leaked API keys, passwords, or sensitive data. 
    If it looks safe, reply with only "SAFE". 
    If it contains a leak or risk, reply starting with "WARNING:".
    Message: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const analysis = response.text.trim();

    // Agar Gemini ko koi khatra ya leak dikhta hai
    if (analysis.startsWith('WARNING')) {
      // User ko public channel mein warning do
      await message.reply(`🚨 **SECURITY ALERT:** Hey <@${message.author.id}>, your message looks like it contains sensitive data or a secret key!`);

      // Agar log channel ID di hai, toh wahan audit log bhejo
      if (LOG_CHANNEL_ID) {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
        if (logChannel) {
          await logChannel.send(
            `🔒 **AUDIT LOG REPORT**\n` +
            `• **User:** <@${message.author.id}> (${message.author.tag})\n` +
            `• **Channel:** <#${message.channel.id}>\n` +
            `• **Leaked Message:** \`\`\`${text}\`\`\``
          );
        }
      }
    }
  } catch (error) {
    console.error('Error aagya:', error);
  }
});

// Bot ko login karo
client.login(process.env.DISCORD_TOKEN);