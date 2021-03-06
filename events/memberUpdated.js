const moment = require('moment');
const format = require('../momentFormat');

module.exports = {
  // Logs a username change in #user-logs.
  process: (bot, guild, oldMember, newMember) => {
    // Cancel on role (or other user) changes we don't care about
    if (oldMember.nickname === newMember.nickname) return;

    let channel = bot.channels.find('name', 'user-logs');

    let oldMemberName, newMemberName;

    if (!oldMember.nickname) {
      oldMemberName = '**' + oldMember.user.username + '**#' + oldMember.user.discriminator;
    } else {
      oldMemberName = '**' + oldMember.nickname + '**#' + oldMember.user.discriminator;
    }

    if (!newMember.nickname) {
      newMemberName = '**' + newMember.user.username + '**#' + newMember.user.discriminator;
    } else {
      newMemberName = '**' + newMember.nickname + '**#' + newMember.user.discriminator;
    }

    channel.sendMessage(
      oldMemberName + ' is now ' + newMemberName + ' ' +
      '(' + moment(Date.now()).format(format) + ')'
    );
  }
};
