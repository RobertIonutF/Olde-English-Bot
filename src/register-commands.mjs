import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';


const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;


const commands = [
// existing from starter
new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
new SlashCommandBuilder()
.setName('echo')
.setDescription('Echo back the provided text')
.addStringOption(o => o.setName('text').setDescription('What should I say?').setRequired(true)),
new SlashCommandBuilder()
.setName('roll')
.setDescription('Roll a dice')
.addIntegerOption(o => o.setName('sides').setDescription('How many sides? (default 6)').setMinValue(2).setMaxValue(1000)),


// NEW: /ye
new SlashCommandBuilder()
.setName('ye')
.setDescription('Render text in Olde English (Shakespearean style)')
.addStringOption(o => o.setName('text').setDescription('Text to translate').setRequired(true))
.addStringOption(o => o
.setName('style')
.setDescription('Flavor')
.addChoices(
{ name: 'plain', value: 'plain' },
{ name: 'bardic (adds “Prithee/Forsooth…”)', value: 'bardic' },
)
),


// NEW: Message context menu
new ContextMenuCommandBuilder()
.setName('Ye Olde-ify')
.setType(ApplicationCommandType.Message),
].map(c => c.toJSON());


const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);


(async () => {
try {
if (!CLIENT_ID || !GUILD_ID) throw new Error('Set CLIENT_ID and GUILD_ID in .env');
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{ body: commands }
);
console.log('✅ Commands registered (guild:', GUILD_ID, ')');
} catch (err) {
console.error('Command registration failed:', err);
process.exit(1);
}
})();