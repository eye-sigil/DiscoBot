module.exports = {
  usage: '[@user]',
  description: 'Slap someone that deserves it.',
  process: (bot, message) => {

    const slapReplies = [
      '\\*slaps $USER around a bit with a large, girthy trout\\* :fish:',
      '\\*slaps $USER with a meaty sausage\\*'
    ];

    let user;

    if (message.mentions.users.first()) {
      user = message.mentions.users.first();
    } else {
      user = message.author;
    }

    message.channel.sendMessage(slapReplies.random().replace('$USER', user));
  }
};
