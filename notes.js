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