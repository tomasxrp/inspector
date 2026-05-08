import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usuarioRoutes from './routes/usuario.routes.js'; 
import clienteRoutes from './routes/cliente.routes.js';
import propiedadRoutes from './routes/propiedad.routes.js';
import fallaRoutes from './routes/falla.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando' });
});

//Rutas express
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes); 
app.use('/api/propiedades', propiedadRoutes);
app.use('/api/fallas', fallaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

