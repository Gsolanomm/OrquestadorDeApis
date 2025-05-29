const express = require('express');
const Logic = require('./Logic');

class App {
  constructor() {
    this.app = express();
    this.logic = new Logic();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.post('/api/preguntarDocumentos', this.handlePreguntarDocumentos.bind(this));
    this.app.post('/api/soloia', this.handleSoloIA.bind(this));
  }

  async handlePreguntarDocumentos(req, res) {
    const { pregunta } = req.body;
    if (!pregunta) {
      return res.status(400).json({ error: 'Falta el campo pregunta' });
    }

    try {
      const respuesta = await this.logic.procesarPreguntaConDocumentos(pregunta);
      return res.json(respuesta);
    } catch (error) {
      console.error("Error al procesar la pregunta:", error.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async handleSoloIA(req, res) {
    const { pregunta } = req.body;
    if (!pregunta) {
      return res.status(400).json({ error: 'Falta el campo pregunta' });
    }

    try {
      const respuesta = await this.logic.consultarTinyLlama(pregunta);
      return res.json(respuesta);
    } catch (error) {
      console.error("Error al consultar a TinyLlama:", error.message);
      return res.status(500).json({ error: 'Error al consultar a TinyLlama' });
    }
  }

  listen(port) {
    this.app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  }
}

module.exports = App;

