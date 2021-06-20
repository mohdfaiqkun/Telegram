import { Low, JSONFile } from "lowdb";
import TelegramBot from "node-telegram-bot-api";
import { join } from "path";
import axios from "axios";
import { networkInterfaces } from "os";

const token = "";
const appID = "";

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

//WEATHER COMMAND
const weatherEndpoint = (city) =>
  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${appID}`;

// Template for weather response
const weatherHtmlTemplate = (name, main, weather, wind, clouds) =>
  `The weather in <b>${name}</b>:
<b>${weather.main}</b> - ${weather.description}
Temperature: <b>${main.temp} °C</b>
Pressure: <b>${main.pressure} hPa</b>
Humidity: <b>${main.humidity} %</b>
Wind: <b>${wind.speed} meter/sec</b>
Clouds: <b>${clouds.all} %</b>
`;

// Function that gets the weather by the city name and stores the user ID
const getWeather = (chatId, city) => {
  const endpoint = weatherEndpoint(city);
  axios.get(endpoint).then(
    (resp) => {
      const { name, main, weather, wind, clouds } = resp.data;

      bot.sendMessage(
        chatId,
        weatherHtmlTemplate(name, main, weather[0], wind, clouds),
        {
          parse_mode: "HTML",
        }
      );
    },
    (error) => {
      console.log("error", error);
      bot.sendMessage(chatId, `Weather not available for: <b>${city}</b>`, {
        parse_mode: "HTML",
      });
    }
  );
};

//On /weather message
bot.onText(/\/weather/, (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(" ")[1];

  if (city === undefined) {
    bot.sendMessage(chatId, `Please provide city name`);
    return;
  }
  getWeather(chatId, city);
});


//IPv4 COMMAND
bot.onText(/\/ipv4/, (msg) => {
  const chatId = msg.chat.id;
  const nets = networkInterfaces();
  const results = {};
  let ipAdd;

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
        ipAdd = name;
      }
    }
  }

  if (results.length > 1) {
    bot.sendMessage(chatId, `There are multiple IP: ${results[ipAdd]}`, {
      parse_mode: "HTML",
    });
  } else {
    bot.sendMessage(chatId, `The IP is: ${results[ipAdd]}`, {
      parse_mode: "HTML",
    });
  }

  return;
});

//SAVE AND RECEIVE NOTE COMMAND

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

//To create and check an array in the database if it is null and return the database
async function readFromDb() {
  const db = await connection();

  if (db.data == null) {
    db.data = [];
  }
  return db.data;
}

//To initiate the module and create the database
async function connection() {
  const file = join("/Users/PC/Desktop/Telegram", "db.json");
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();
  return db;
}

//To push new data into the database
async function saveToDb(userID, savenote, newUser = 0) {
  const db = await connection();
  const notes = await readFromDb();

  if (!newUser) {
    notes.forEach(function (element) {
      if (element.userID === userID) {
        element.notes.push(savenote);
      }
    });
  } else {
    notes.push({ userID, notes: [`${savenote}`] });
  }
  db.data = notes;
  await db.write();
}

//Read notes
bot.onText(/\/read_note (.+)/, async (msg, readmatch) => {
  const data = await readFromDb();
  const userID = msg.chat.id;
  const readnote = readmatch[1];
  const filterResult = data.filter((note) => note.userID === userID);
  let notesLine = "All your notes: \n";

  if (filterResult.length == 1 && readnote === "all") {
    if (filterResult[0].notes.length === 0) {
      bot.sendMessage(userID, `No notes`, { parse_mode: "HTML" });
    } else {
      filterResult[0].notes.forEach(function (element) {
        notesLine += `${element}\n`;
      });
      bot.sendMessage(userID, `${notesLine}`, { parse_mode: "HTML" });
    }
    return;
  }

  if (Number.isInteger(parseInt(readnote)) && readnote > 0) {
    if (filterResult.length === 0) {
      bot.sendMessage(userID, `No notes saved yet`, { parse_mode: "HTML" });
    } else {
      if (filterResult[0].notes.length >= readnote) {
        bot.sendMessage(
          userID,
          `Your notes: ${filterResult[0].notes[readnote - 1]}`,
          { parse_mode: "HTML" }
        );
      } else {
        bot.sendMessage(
          userID,
          `You only have ${filterResult[0].notes.length} notes`,
          { parse_mode: "HTML" }
        );
      }
    }
  } else {
    bot.sendMessage(userID, `Please provide a valid number`, {
      parse_mode: "HTML",
    });
  }
});
