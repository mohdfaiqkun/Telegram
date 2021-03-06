import TelegramBot from "node-telegram-bot-api";
import { getIP } from "./ipv4.js";
import { getWeather } from "./weather.js";
import { readFromDb, saveToDb, readAll, readNotesNum } from "./notes.js";

const token = "";

//Creating a Telegram Bot
const bot = new TelegramBot(token, {
  polling: true,
});

// On /start message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Welcome user! I am <b>Bot-Ato</b>!
    
Available commands:

/weather <b>city</b> - type in your <b>city</b> to get the weather!
/ipv4 - get the server's IP address!
/save_note - type your notes after the command to save it!
/read_note <b>all/#</b>- type <b>all</b> to get all your notes or a <b>number</b> to retrieve a specific note!

  `,
    {
      parse_mode: "HTML",
    }
  );
});

//On /weather message
bot.onText(/\/weather/, async (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(" ")[1];

  if (city === undefined) {
    bot.sendMessage(chatId, `Please provide city name`);
    return;
  }
  const weatherResult = await getWeather(city);
  bot.sendMessage(chatId, weatherResult, { parse_mode: "HTML" });
  return;
});

//On /ipv4 message
bot.onText(/\/ipv4/, async (msg) => {
  const chatId = msg.chat.id;
  const IPResults = await getIP();

  if (IPResults.length > 1) {
    bot.sendMessage(chatId, `There are multiple IP: ${IPResults}`, {
      parse_mode: "HTML",
    });
  } else {
    bot.sendMessage(chatId, `The IP is: ${IPResults}`, {
      parse_mode: "HTML",
    });
  }
  return;
});

//SAVE AND READ NOTE COMMAND

//Save notes
bot.onText(/\/save_note (.+)/, async (msg, savematch) => {
  const data = await readFromDb();
  const userID = msg.chat.id;
  const savenote = savematch[1];
  const filterResult = data.filter((note) => note.userID === userID);

  //To check if new user or not
  if (filterResult.length === 0) {
    saveToDb(userID, savenote, 1);
  } else {
    saveToDb(userID, savenote);
  }
  bot.sendMessage(userID, `Note saved!`, { parse_mode: "HTML" });
});

//Read notes
bot.onText(/\/read_note (.+)/, async (msg, readmatch) => {
  const userID = msg.chat.id;
  const readnote = readmatch[1];

  if (readnote === "all") {
    const readAllVali = await readAll(userID);
    bot.sendMessage(userID, readAllVali, { parse_mode: "HTML" });
    return;
  }

  if (Number.isInteger(parseInt(readnote)) && readnote > 0) {
    const readNoteID = await readNotesNum(userID, readnote);
    bot.sendMessage(userID, readNoteID, { parse_mode: "HTML" });
  } else {
    bot.sendMessage(userID, `Please provide a valid number`, {
      parse_mode: "HTML",
    });
  }
});
