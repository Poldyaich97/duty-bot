import { Telegraf } from 'telegraf';
import config from 'config';
import { initCron } from './cron.js';
import { writeToFile, readFile, getUsernamesFromMessage } from './utils.js';

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

initCron(bot);

bot.start((ctx) => ctx.reply('Hello! I\'m duty-bot 👨‍🚒'))
bot.help((ctx) => ctx.reply(`I\'m duty-bot.
/assign - assign current duty
/list - show all users
/add - add new users
/remove - remove user
Send your feedback to @PoldyaevD`))

bot.command('duty', async (ctx) => {
  const data = readFile();
  if (!data.duty) {
    bot.telegram.sendMessage(ctx.update.message.chat.id, `No one is assigned as duty`);
  }
  bot.telegram.sendMessage(ctx.update.message.chat.id, `${data.duty} - todays duty`);
})

bot.command('remove-duty', async (ctx) => {
  const data = readFile();
  if (!data.duty) {
    bot.telegram.sendMessage(ctx.update.message.chat.id, `No one has been assigned duty yet`);
  }
  try {
    writeToFile({ duty: '' })
  } catch (err) {
    console.error(err);
    bot.telegram.sendMessage(ctx.update.message.chat.id, `When removing duty something went wrong 🥲`);
    return;
  }
  bot.telegram.sendMessage(ctx.update.message.chat.id, `Duty has been removed`);
})

bot.command('assign', async (ctx) => {
  const data = readFile();

  const usernames = getUsernamesFromMessage(ctx.update.message);
  if (usernames.length === 0) {
    console.log('Not found mention');
    bot.telegram.sendMessage(ctx.update.message.chat.id, "Not found any mention");
    return;
  }
  if (usernames.length > 1) {
    console.log('Found several mention');
    bot.telegram.sendMessage(ctx.update.message.chat.id, "You can assign only one duty");
    return;
  }
  const username = usernames[0];
  if (data.users.includes(username)) {
    bot.telegram.sendMessage(ctx.update.message.chat.id, "You mentioned a user who is not in the list. You can add the user by send /add");
  }

  try {
    writeToFile({ duty: username })
  } catch (err) {
    console.error(err);
    bot.telegram.sendMessage(ctx.update.message.chat.id, `When assigning new duty something went wrong 🥲`);
    return;
  }

  bot.telegram.sendMessage(ctx.update.message.chat.id, `${username} is assigned as duty 👨‍🚒`);
})

bot.command(['users', 'list'], async (ctx) => {
  const data = readFile();
  if (data.users.length === 0) {
    bot.telegram.sendMessage(ctx.update.message.chat.id, `List users is empty`);
    return;
  }
  const message = data.users.map(u => u === data.duty ? `${u} - duty 👨‍🚒` : u).join('\n');
  bot.telegram.sendMessage(ctx.update.message.chat.id, message);
})

bot.command('add', async (ctx) => {
  const data = readFile();

  const usernames = getUsernamesFromMessage(ctx.update.message);
  if (usernames.length === 0) {
    console.log('Not found mention');
    bot.telegram.sendMessage(ctx.update.message.chat.id, `Nothing to add`);
    return;
  }
  const newUsersCount = usernames.reduce((acc, user) => {
    if (data.users.includes(user)) {
      return acc - 1;
    }
    return acc;
  }, usernames.length);
  if (newUsersCount === 0) {
    bot.telegram.sendMessage(ctx.update.message.chat.id, `All users already in the list`);
    return;
  }
  const newUsers = Array.from(new Set([...data.users, ...usernames]));
  try {
    writeToFile({ users: newUsers })
  } catch (err) {
    console.error(err);
    bot.telegram.sendMessage(ctx.update.message.chat.id, `When adding new users something went wrong 🥲`);
    return;
  }

  bot.telegram.sendMessage(ctx.update.message.chat.id, `${newUsersCount} users is added. For list all users send /list`);
})

bot.command(['remove', 'delete', 'del'], async (ctx) => {
  const data = readFile();
  const usernamesToDelete = getUsernamesFromMessage(ctx.update.message);
  if (usernamesToDelete.length === 0) {
    console.log('found mention');
    bot.telegram.sendMessage(ctx.update.message.chat.id, `Nothing to remove`);
    return;
  }
  const mentionUsersCount = usernames.reduce((acc, user) => {
    if (data.users.includes(user)) {
      return acc + 1;
    }
    return acc;
  }, 0);
  if (mentionUsersCount === 0) {
    bot.telegram.sendMessage(ctx.update.message.chat.id, `All users already not in the list`);
    return;
  }
  const newUsers = data.users.filter(u => !usernamesToDelete.includes(u));
  writeToFile({ users: newUsers });
  bot.telegram.sendMessage(ctx.update.message.chat.id, `${mentionUsersCount} users is removed. For list all users send /list`);
})

bot.on(['new_chat_members'], (ctx) => {
  const json = JSON.stringify(ctx, undefined, 2);
  bot.telegram.sendMessage(ctx.update.message.chat.id, "Всем привет в этом чатике ✌️");
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
