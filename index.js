//Importamos las librarías requeridas
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();

// Creamos la aplicación express
const app = express()

// Creamos un parser de tipo application/json
const jsonParser = bodyParser.json()

// Abrimos la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    // Creamos la tabla 'todos' si no existe
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla "todos" creada o ya existente.');
        }
    });
});

// Creamos un endpoint POST llamado 'agrega_todo'
app.post('/agrega_todo', jsonParser, function (req, res) {
    const { todo } = req.body; // Extraemos el campo 'todo' del cuerpo de la solicitud

    if (!todo) {
        res.status(400).json({ error: 'Falta el campo todo' });
        return;
    }

    // Insertamos el 'todo' en la base de datos con el timestamp actual
    const unixTimestamp = Math.floor(Date.now() / 1000); // Obtenemos el timestamp en formato UNIX
    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, ?)');
    
    stmt.run(todo, unixTimestamp, function (err) {
        if (err) {
            res.status(500).json({ error: 'Error al insertar el todo' });
        } else {
            res.status(201).json({ message: 'Todo agregado con éxito', id: this.lastID });
        }
    });

    stmt.finalize();
});

// Endpoint de prueba
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
});

// Corremos el servidor en el puerto 3000
const port = 3000;

app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});
