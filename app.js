const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 1000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos desde la carpeta "public"

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Esquema y modelo de MongoDB
const AlumnoSchema = new mongoose.Schema({
    nombre: String,
    grado: String,
    imagen: String,
}, { collection: 'fotos_aves' });

const Alumno = mongoose.model('Alumno', AlumnoSchema);

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Rutas
app.post('/upload', upload.single('imagen'), async (req, res) => {
    const { nombre, grado } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : '';

    const nuevoAlumno = new Alumno({ nombre, grado, imagen });
    await nuevoAlumno.save();

    res.json({ message: 'Alumno registrado con éxito', alumno: nuevoAlumno });
});

app.get('/alumnos', async (req, res) => {
    const alumnos = await Alumno.find();
    res.json(alumnos);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en https://birding.onrender.com`);
});