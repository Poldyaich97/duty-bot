import fs from 'fs';
import config from 'config';


const INIT_STRUCT = { users: [], duty: '' };
const INIT_STRUCT_STR = JSON.stringify(INIT_STRUCT, undefined, 1);

export function readFile() {
    const rawFileData = fs.readFileSync(config.get('FILE_NAME'), { encoding: 'utf8', flag: 'a+' }) || INIT_STRUCT_STR;
    return JSON.parse(rawFileData);
}

export function writeToFile(data) {
    const fileData = readFile();
    const updatedData = { ...fileData, ...data };
    const writeData = JSON.stringify(updatedData, undefined, 1);
    fs.writeFileSync(config.get('FILE_NAME'), writeData);
}

export function getUsernamesFromMessage(message) {
    const mentions = message.entities.filter(e => e.type === 'mention');
    const usernames = mentions.map((mention) => {
        return message.text.substring(mention.offset, mention.offset + mention.length);
    })
    return usernames;
}