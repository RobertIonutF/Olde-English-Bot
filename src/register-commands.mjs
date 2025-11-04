import 'dotenv/config';
import {
  REST,
  Routes,
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} from 'discord.js';

// Ensure required environment variables exist before continuing
const requiredEnvVars = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  console.error(`   ${missingVars.join(', ')}`);
  console.error('Create a .env file with these variables set.');
  process.exitCode = 1;
  process.exit(1);
}

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Guard against obviously invalid snowflakes (Discord IDs are 17-20 digits)
const snowflakePattern = /^\d{17,20}$/;

if (!snowflakePattern.test(CLIENT_ID)) {
  console.error('❌ CLIENT_ID is not a valid Discord ID (must be 17-20 digits).');
  process.exit(1);
}

if (GUILD_ID && !snowflakePattern.test(GUILD_ID)) {
  console.error('❌ GUILD_ID is not a valid Discord ID (must be 17-20 digits).');
  process.exit(1);
}

// Generate invite URL with proper scopes
const PERMISSIONS = '274877908992'; // Send Messages, Use Slash Commands, Read Messages
const INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${PERMISSIONS}&scope=bot%20applications.commands`;

console.log('\n🔗 Bot Invite URL (use this to add bot to your server):');
console.log(`   ${INVITE_URL}\n`);

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Echo back the provided text')
    .addStringOption((o) =>
      o
        .setName('text')
        .setDescription('What should I say?')
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll a dice')
    .addIntegerOption((o) =>
      o
        .setName('sides')
        .setDescription('How many sides? (default 6)')
        .setMinValue(2)
        .setMaxValue(1000),
    ),
  new SlashCommandBuilder()
    .setName('ye')
    .setDescription('Render text in Olde English (Shakespearean style)')
    .addStringOption((o) =>
      o
        .setName('text')
        .setDescription('Text to translate')
        .setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName('style')
        .setDescription('Flavor')
        .addChoices(
          { name: 'plain', value: 'plain' },
          { name: 'bardic (adds “Prithee/Forsooth…”)', value: 'bardic' },
        ),
    ),
  new ContextMenuCommandBuilder()
    .setName('Ye Olde-ify')
    .setType(ApplicationCommandType.Message),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log('📝 Starting command registration…');
    console.log(`   • Application ID: ${CLIENT_ID}`);

    if (GUILD_ID) {
      // Register guild-specific commands (instant updates, good for testing)
      console.log(`   • Guild ID: ${GUILD_ID}`);
      console.log(`   • Registering to specific guild (instant updates)…`);

      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
      });

      console.log('✅ Guild commands registered successfully!');
      console.log('   Commands are now available in your guild.');
    } else {
      // Register global commands (takes up to 1 hour to propagate)
      console.log('   • No GUILD_ID set, registering globally…');
      console.log('   ⚠️  Global commands can take up to 1 hour to appear!');

      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });

      console.log('✅ Global commands registered successfully!');
      console.log('   Commands will be available in all servers within ~1 hour.');
    }
  } catch (error) {
    if (error?.code === 50001 || error?.rawError?.code === 50001) {
      console.error('\n❌ Missing Access (code 50001)');
      console.error('   This means the bot cannot access the specified guild.');
      console.error('\n📋 Troubleshooting steps:');
      console.error('   1. Make sure the bot is invited to your server');
      console.error('   2. Use the invite URL printed above (must include applications.commands scope)');
      console.error('   3. Verify CLIENT_ID matches your bot application');
      console.error('   4. Verify GUILD_ID is the correct server ID');
      console.error('\n💡 Alternative: Remove GUILD_ID from .env to register globally');
      console.error('   (Global commands work everywhere but take ~1 hour to update)');
    } else if (error?.code === 401 || error?.status === 401) {
      console.error('\n❌ Invalid Bot Token (401 Unauthorized)');
      console.error('   Check that DISCORD_TOKEN in .env is correct');
    } else {
      console.error('\n❌ Failed to register commands:', error);
      if (error?.message) console.error(`   Error: ${error.message}`);
      if (error?.code) console.error(`   Code: ${error.code}`);
    }
    process.exitCode = 1;
  }
}

registerCommands();
