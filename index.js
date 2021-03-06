const Discord = require('discord.js');
const firebase = require('firebase');
const moment = require('moment');
const format = require('./momentFormat');
const cron = require('node-cron');

require('./utils');

// Auth token
const token = process.env.AUTH_TOKEN;
if (!token) {
  console.log('No auth token found, please set the AUTH_TOKEN environment variable.\n');
  process.exit();
}

// Debug mode
let debug = false;
if (process.env.APP_DEBUG === 'true') debug = true;

// Time
const startTime = Date.now();

// Firebase
const config = {
  apiKey: process.env.FIREBASE_API,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
};

firebase.initializeApp(config);

// Commands
let commands = {};

// Import commands
commands.avatar = require('./commands/avatar');
commands.boop = require('./commands/boop');
commands.cat = require('./commands/cat');
commands.choose = require('./commands/choose');
commands.getinfo = require('./commands/getinfo');
commands.help = require('./commands/help');
commands.hug = require('./commands/hug');
commands.joined = require('./commands/joined');
commands.magic8ball = require('./commands/magic8ball');
commands.penguin = require('./commands/penguin');
commands.regions = require('./commands/regions');
commands.role = require('./commands/role');
commands.set18 = require('./commands/set18');
commands.setinfo = require('./commands/setinfo');
commands.setregion = require('./commands/setregion');
commands.slap = require('./commands/slap');
commands.spray = require('./commands/spray');
commands.unset18 = require('./commands/unset18');
commands.unsetinfo = require('./commands/unsetinfo');
commands.unsetregion = require('./commands/unsetregion');

// Admin commands
let adminCommands = {};

// Import admin commands
adminCommands.timeout = require('./admin-commands/timeout');

// Export commands for use in other modules (help)
module.exports.commands = commands;
module.exports.adminCommands = adminCommands;

// Events
let events = {};

// Import events
events.memberBanned = require('./events/memberBanned');
events.memberJoined = require('./events/memberJoined');
events.memberLeft = require('./events/memberLeft');
events.memberUnbanned = require('./events/memberUnbanned');
events.memberUpdated = require('./events/memberUpdated');
events.messageDeleted = require('./events/messageDeleted');
events.messageUpdated = require('./events/messageUpdated');

// Cron
let cronJobs = {};

// Import cron tasks
cronJobs.timeout = require('./admin-commands/utilities/check-timeout');

// Cron
cron.schedule('*/5 * * * *', function() {
  if (debug) console.log('Checking for expired timeouts');
  cronJobs.timeout.process(bot);
}, true);

// Init bot
const bot = new Discord.Client();
bot.on('ready', () => {
  console.log('Bot ready!');
});

// Handle messages
bot.on('message', message => {
  if (!message.author.bot) { // No bots

    let commandText;

    if (message.content[0] === '!') { // Check for a command via ! prefix
      commandText = message.content.split(' ')[0].substring(1);
    } // else if (message.content.indexOf(bot.user.mention()) == 0) { // Check for a command via bot tag
      // commandText = message.content.split(' ')[1].toLowerCase();
    // }
    else { // no command
      if (debug) console.log('No command.');
      return;
    }

    let command = commands[commandText.toLowerCase()];

    // Admin/Mod check
    let permission = false;
    let adminCommand = false;

    // Only do this check if we're in a guild, otherwise ignore and move on.
    // So some commands can still be run in DMs
    //
    // TODO: There's a hacky way round this but I'm not sure if I want to?
    if (message.guild) {
      const adminRole = message.guild.roles.find('name', 'Admin');
      const moderatorRole = message.guild.roles.find('name', 'Moderator');
      let author = message.guild.member(message.author);

      for (let [id, currentRole] of author.roles) {
        if (currentRole === adminRole || currentRole === moderatorRole || message.author.id === '120897878347481088') {
          permission = true;
        }
      }
    }

    // If command is not a regular command, check if it's an admin command instead
    if (!command && permission) {
      command = adminCommands[commandText.toLowerCase()];
      if (adminCommands[commandText.toLowerCase()]) adminCommand = true;
    }

    // Admin only command but no permission
    if (adminCommand && !permission) {
      message.reply('naughty naughty... :wink: Only Admins and Moderators can use the `!' + commandText + '` command.');
      return;
    }

    try {
      command.process(bot, message, permission);
    } catch (e) {
      if (debug) console.log('Command ' + commandText + ' failed :(\n' + e.stack);
    }
  }
});

// Member joined
bot.on('guildMemberAdd', (guild, member) => {
  events.memberJoined.process(bot, guild, member);
});

// Member left
bot.on('guildMemberRemove', (guild, member) => {
  events.memberLeft.process(bot, guild, member);
});

// Member banned
bot.on('guildBanAdd', (guild, member) => {
  events.memberBanned.process(bot, guild, member);
});

// Member unbanned
bot.on('guildBanRemove', (guild, member) => {
  events.memberUnbanned.process(bot, guild, member);
});

// Member update (Added/removed role, changed nickname)
bot.on('guildMemberUpdate', (guild, oldMember, newMember) => {
  // events.memberUpdated.process(bot, guild, oldMember, newMember);
});

// Message deleted
bot.on('messageDelete', (message) => {
  events.messageDeleted.process(bot, message);
});

// Message edited
bot.on('messageUpdate', (oldMessage, newMessage) => {
  // events.messageUpdated.process(bot, oldMessage, newMessage);
});

// Login
if (debug) {
  console.log('Token: ', token);
  console.log('Start time: ', moment(startTime).format(format));
}

bot.login(token);
