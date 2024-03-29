const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

// Connexion à la base de données
async function connect() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "beerbdd",
  });
  return connection;
}

// Définition des modèles
// ...

// Routes pour les brasseries
const app = express();
app.use(bodyParser.json());

let connection;

(async function () {
  connection = await connect();
})();

app.get("/brasseries", async (req, res) => {
  const [rows] = await connection.execute("SELECT * FROM Brasserie");
  res.json(rows);
});

app.get("/brasseries/:id_brasserie", async (req, res) => {
  const [rows] = await connection.execute(
    "SELECT * FROM Brasserie WHERE id_brasserie = ?",
    [req.params.id_brasserie]
  );
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).send("Brasserie non trouvée");
  }
});

app.post("/brasseries", async (req, res) => {
  const [result] = await connection.execute(
    "INSERT INTO Brasserie (nom_brasserie, ville, pays, date_creation) VALUES (?, ?, ?, ?)",
    [
      req.body.nom_brasserie,
      req.body.ville,
      req.body.pays,
      req.body.date_creation,
    ]
  );
  const [rows] = await connection.execute(
    "SELECT * FROM Brasserie WHERE id_brasserie = ?",
    [result.insertId]
  );
  res.json(rows[0]);
});

app.put("/brasseries/:id_brasserie", async (req, res) => {
  const [rows] = await connection.execute(
    "UPDATE Brasserie SET nom_brasserie = ?, ville = ?, pays = ?, date_creation = ? WHERE id_brasserie = ?",
    [
      req.body.nom_brasserie,
      req.body.ville,
      req.body.pays,
      req.body.date_creation,
      req.params.id_brasserie,
    ]
  );
  if (rows.affectedRows > 0) {
    const [updatedRows] = await connection.execute(
      "SELECT * FROM Brasserie WHERE id_brasserie = ?",
      [req.params.id_brasserie]
    );
    res.json(updatedRows[0]);
  } else {
    res.status(404).send("Brasserie non trouvée");
  }
});

app.delete("/brasseries/:id_brasserie", async (req, res) => {
  try {
    const [commands] = await connection.execute(
      "SELECT * FROM Commande WHERE brasserie_id = ?",
      [req.params.id_brasserie]
    );
    if (commands.length > 0) {
      const [rows] = await connection.execute(
        "DELETE FROM Commande WHERE brasserie_id = ?",
        [req.params.id_brasserie]
      );
    }
    const [rows] = await connection.execute(
      "DELETE FROM Brasserie WHERE id_brasserie = ?",
      [req.params.id_brasserie]
    );
    if (rows.affectedRows > 0) {
      res.send("Brasserie supprimée");
    } else {
      res.status(404).send("Brasserie non trouvée");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Erreur lors de la suppression de la brasserie");
  }
});

// Routes pour les bières
app.get("/bieres", async (req, res) => {
  const [rows] = await connection.execute("SELECT * FROM Biere");
  res.json(rows);
});

app.get("/bieres/:id_biere", async (req, res) => {
  const [rows] = await connection.execute(
    "SELECT * FROM Biere WHERE id_biere = ?",
    [req.params.id_biere]
  );
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).send("Bière non trouvée");
  }
});

app.post("/bieres", async (req, res) => {
  const [result] = await connection.execute(
    "INSERT INTO Biere (nom_biere, type, degre_alcool, brasserie_id) VALUES (?, ?, ?, ?)",
    [
      req.body.nom_biere,
      req.body.type,
      req.body.degre_alcool,
      req.body.brasserie_id,
    ]
  );
  const [rows] = await connection.execute(
    "SELECT * FROM Biere WHERE id_biere = ?",
    [result.insertId]
  );
  res.json(rows[0]);
});

app.put("/bieres/:id_biere", async (req, res) => {
  const [rows] = await connection.execute(
    "UPDATE Biere SET nom_biere = ?, type = ?, degre_alcool = ?, brasserie_id = ? WHERE id_biere = ?",
    [
      req.body.nom_biere,
      req.body.type,
      req.body.degre_alcool,
      req.body.brasserie_id,
      req.params.id_biere,
    ]
  );
  if (rows.affectedRows > 0) {
    const [updatedRows] = await connection.execute(
      "SELECT * FROM Biere WHERE id_biere = ?",
      [req.params.id_biere]
    );
    res.json(updatedRows[0]);
  } else {
    res.status(404).send("Bière non trouvée");
  }
});

app.delete("/bieres/:id_biere", async (req, res) => {
  // delete referencing rows in `Commande_Biere` table first
  const [cmdRows] = await connection.execute(
    "DELETE FROM Commande_Biere WHERE id_biere = ?",
    [req.params.id_biere]
  );

  // delete the row in `Biere` table
  const [beerRows] = await connection.execute(
    "DELETE FROM Biere WHERE id_biere = ?",
    [req.params.id_biere]
  );

  if (beerRows.affectedRows > 0) {
    res.send("Bière supprimée");
  } else {
    res.status(404).send("Bière non trouvée");
  }
});

// Routes pour les commandes

app.get("/commandes", async (req, res) => {
  const [rows] = await connection.execute("SELECT * FROM Commande");
  res.json(rows);
});

app.get("/commandes/:id_commande", async (req, res) => {
  const [rows] = await connection.execute(
    "SELECT * FROM Commande WHERE id_commande = ?",
    [req.params.id_commande]
  );
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).send("Commande non trouvée");
  }
});

app.post("/commandes", async (req, res) => {
  const [result] = await connection.execute(
    "INSERT INTO Commande (date_commande, brasserie_id) VALUES (?, ?)",
    [req.body.date_commande, req.body.brasserie_id]
  );
  const [rows] = await connection.execute(
    "SELECT * FROM Commande WHERE id_commande = ?",
    [result.insertId]
  );
  res.json(rows[0]);
});

app.put("/commandes/:id_commande", async (req, res) => {
  const [rows] = await connection.execute(
    "UPDATE Commande SET date_commande = ?, brasserie_id = ? WHERE id_commande = ?",
    [req.body.date_commande, req.body.brasserie_id, req.params.id_commande]
  );
  if (rows.affectedRows > 0) {
    const [updatedRows] = await connection.execute(
      "SELECT * FROM Commande WHERE id_commande = ?",
      [req.params.id_commande]
    );
    res.json(updatedRows[0]);
  } else {
    res.status(404).send("Commande non trouvée");
  }
});

app.delete("/commandes/:id_commande", async (req, res) => {
  const [rows] = await connection.execute(
    "DELETE FROM Commande WHERE id_commande = ?",
    [req.params.id_commande]
  );
  if (rows.affectedRows > 0) {
    res.send("Commande supprimée");
  } else {
    res.status(404).send("Commande non trouvée");
  }
});

app.get("/commandes/:id_commande/bieres", async (req, res) => {
  const [rows] = await connection.execute(
    "SELECT b.* FROM Commande c JOIN Commande_Biere cb ON c.id_commande = cb.id_commande JOIN Biere b ON cb.id_biere = b.id_biere WHERE c.id_commande = ?",
    [req.params.id_commande]
  );
  res.json(rows);
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log("Serveur démarré sur le port 3000");
});
