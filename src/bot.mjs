import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { toOldeEnglish } from './olde-english.mjs';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });


client.once(Events.ClientReady, (c) => {
console.log(`🤖 Logged in as ${c.user.tag}`);
});


client.on(Events.InteractionCreate, async (interaction) => {
try {
// Slash command: /ye
if (interaction.isChatInputCommand() && interaction.commandName === 'ye') {
const text = interaction.options.getString('text', true);
const style = interaction.options.getString('style') ?? 'plain';
const out = toOldeEnglish(text, { style });
await interaction.reply(out.slice(0, 2000));
return;
}


// Message context: Ye Olde-ify
if (interaction.isMessageContextMenuCommand() && interaction.commandName === 'Ye Olde-ify') {
const original = interaction.targetMessage?.content ?? '';
if (!original) return interaction.reply({ content: 'That message hath no plain text to transform.', ephemeral: true });
const out = toOldeEnglish(original, { style: 'plain' });
await interaction.reply({ content: out.slice(0, 2000), ephemeral: false });
return;
}


// Existing starter commands
if (interaction.isChatInputCommand()) {
if (interaction.commandName === 'ping') return interaction.reply('Pong!');
if (interaction.commandName === 'echo') return interaction.reply(interaction.options.getString('text', true));
if (interaction.commandName === 'roll') {
const sides = interaction.options.getInteger('sides') ?? 6;
const result = Math.floor(Math.random() * sides) + 1;
return interaction.reply(`🎲 You rolled **${result}** (1–${sides})`);
}
}
} catch (err) {
console.error(err);
if (interaction.deferred || interaction.replied) {
await interaction.followUp({ content: 'Anon, an error hath occur’d 😅', ephemeral: true });
} else {
await interaction.reply({ content: 'Anon, an error hath occur’d 😅', ephemeral: true });
}
}
});


client.login(process.env.DISCORD_TOKEN);