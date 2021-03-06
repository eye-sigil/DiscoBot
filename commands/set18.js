module.exports = {
  usage: '',
  description: 'Gives you the 18+ role, allows access to #over-18 and #over-18-text.',
  process: (bot, message) => {
    // Error check so not in PM
    if (message.channel.type !== 'text') {
      message.reply('sorry... I can\'t set 18+ inside private messages.');
      return;
    }

    let role = message.guild.roles.find('name', '18+');
    let member = message.guild.member(message.author);
    let currentRoles = [];

    for (var [id, currentRole] of member.roles) {

      // Check if new region is already set on member
      if (currentRole === role) {
        message.reply('you\'ve already been set to ' + role.name);
        return;
      }

      currentRoles.push(currentRole);
    }

    // Add the new region to the array
    currentRoles.push(role);

    // Reapply the roles!
    member.setRoles(currentRoles);

    message.reply('I\'ve set you to ' + role.name + ' :wink:');
  }
};
