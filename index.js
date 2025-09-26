const mineflayer = require('mineflayer');
const express = require('express');

// -------------- CONFIG --------------
const HOST = process.env.HOST || 'TheHomies.play.hosting';
const PORT = parseInt(process.env.PORT || '51145', 10);
const BOT_NAME = process.env.BOT_NAME || 'AFK_HELPER';
const MC_VERSION = process.env.MC_VERSION || false;
const CHAT_INTERVAL_MINUTES = parseInt(process.env.CHAT_INTERVAL_MINUTES || '10', 10);
const WEB_PORT = process.env.WEB_PORT || 3000;
let reconnectDelay = 5000;

// -------------- EXPRESS WEB SERVER FOR UPTIMEROBOT ----------------
const app = express();
app.get('/', (req, res) => res.send('AFK bot alive 🚀'));
app.listen(WEB_PORT, () => console.log(`Web server running on port ${WEB_PORT}`));

// -------------- CHAT MESSAGES ----------------
const messages = [
  "Without me this will be gone in 30 minutes 😱",
  "I'm here keeping the server alive 💪",
  "This server sleeps without me! ⚡ Join soon!",
  "AFK bot standing guard 🛡️",
  "Hey! Server’s staying alive thanks to me 😄"
];
function pickMessage() {
  const base = messages[Math.floor(Math.random() * messages.length)];
  const suffix = Math.random() < 0.3 ? " — join if you can!" : "";
  return base + suffix;
}

// -------------- BOT FUNCTION ----------------
function startBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: BOT_NAME,
    auth: 'offline',
    version: MC_VERSION
  });

  bot.once('login', () => {
    console.log(`[bot] Logged in as ${BOT_NAME}`);
    reconnectDelay = 5000;
  });

  bot.on('spawn', () => {
    console.log('[bot] spawned');

    bot._afkInterval = setInterval(() => {
      try {
        bot.setControlState('forward', true);
        setTimeout(() => bot.setControlState('forward', false), 900);
        bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4, true);
      } catch (e) {}
    }, 60 * 1000);

    bot._chatInterval = setInterval(() => {
      try { bot.chat(pickMessage()); } catch (e) {}
    }, CHAT_INTERVAL_MINUTES * 60 * 1000);
  });

  bot.on('kicked', (reason) => console.log('[bot] kicked:', reason));
  bot.on('end', () => {
    console.log(`[bot] disconnected. Reconnecting in ${reconnectDelay} ms`);
    clearInterval(bot._afkInterval);
    clearInterval(bot._chatInterval);
    setTimeout(startBot, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 1.5, 300000);
  });
  bot.on('error', (err) => console.log('[bot] error', err?.message || err));
}
startBot();

