import { Low, JSONFile } from "lowdb";

//To initiate the module and create the database
async function connection() {
  const file = "./db.json";
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  await db.read();
  return db;
}

//To create and check an array in the database if it is null and return the database
export async function readFromDb() {
  const db = await connection();

  if (db.data == null) {
    db.data = [];
  }
  return db.data;
}

//To push new data into the database
export async function saveToDb(userID, savenote, newUser = 0) {
  const db = await connection();
  const notes = await readFromDb();

  //Check for user existance
  if (newUser) {
    notes.push({ userID, notes: [`${savenote}`] });
  } else {
    notes.forEach(function (element) {
      if (element.userID === userID) {
        element.notes.push(savenote);
      }
    });
  }
  db.data = notes;
  await db.write();
}

//Validation for when user input "all" after /read_note
export async function readAll(userID) {
  const data = await readFromDb();
  const filterResult = data.filter((note) => note.userID === userID);
  let notesLines = "All your notes: \n";

  if (filterResult.length === 0) {
    return "No notes";
  } else {
    filterResult[0].notes.forEach(function (element) {
      notesLines += `${element}\n`;
    });
    return notesLines;
  }
}

//Getting notes by numbers
export async function readNotesNum(userID, readnote) {
  const data = await readFromDb();
  const filterResult = data.filter((note) => note.userID === userID);

  if (filterResult.length === 0) {
    return `No notes saved yet`;
  } else {
    if (filterResult[0].notes.length >= readnote) {
      return `Your notes: ${filterResult[0].notes[readnote - 1]}`;
    } else {
      return `You only have ${filterResult[0].notes.length} notes`;
    }
  }
}
