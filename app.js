const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "cricketTeam.db");

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDbAndServer = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running....");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`;
  const players = await db.all(getPlayersQuery);
  response.send(
    players.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//get a player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team
 WHERE 
 player_id = ${playerId};`;
  const player = await db.get(getPlayersQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// post a player details

app.post("/players/", async (request, response) => {
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const postDetails = `
    INSERT INTO
    cricket_team(player_name,jersey_number,role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const result = await db.run(postDetails);
  response.send(`Player Added to Team`);
});
//ccbp submit NJSCPXTWMS

//get a player

//put
app.put(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
