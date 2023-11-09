import cron from 'node-cron';
import { readFile } from './utils.js';
import config from 'config';


const EveryWorkdayAtNineAm = '00 9 * * 1-5';


export function initCron(bot) {
    cron.schedule(EveryWorkdayAtNineAm, () => {
        try {
            const data = readFile();
            if (!data.duty) {
                bot.telegram.sendMessage(config.get('GROUP_ID'), `Nobody assigned as duty!`);
                return;
            }
            bot.telegram.sendMessage(config.get('GROUP_ID'), `${data.duty} you are duty today!`);
        } catch (err) {
            console.error(err);
            bot.telegram.sendMessage(ctx.update.message.chat.id, `When sending a notification about the duty something went wrong 🥲`);
        }
    })
}
