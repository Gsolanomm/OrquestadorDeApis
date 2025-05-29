const axios = require('axios');

class Logic {
  constructor() {
    this.tinyllamaUrl = 'http://localhost:11434/api/generate';
    this.apiUrl = 'http://localhost:5000';
  }

  async obtenerDocumentos() {
    try {
      const response = await axios.get(`${this.apiUrl}/documentos`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener documentos:", error.message);
      return null;
    }
  }

  async procesarPreguntaConDocumentos(pregunta) {
    const documentos = await this.obtenerDocumentos();
    if (!documentos || !Array.isArray(documentos)) {
      throw new Error('No se pudieron obtener documentos');
    }

    const preguntaLower = pregunta.toLowerCase();
    const documentosRelacionados = documentos.filter(doc =>
      doc.contenido && doc.contenido.toLowerCase().includes(preguntaLower)
    );

    if (documentosRelacionados.length === 0) {
      return { mensaje: 'No hay documentos relacionados con la pregunta.' };
    }

    const contexto = documentosRelacionados.map(d => d.contenido).join('\n---\n');
    const prompt = `Responde basándote en estos documentos:\n${contexto}\nPregunta: ${pregunta}`;

    const response = await this.consultarTinyLlama(prompt);
    return { respuesta: response.data.response };
  }

async consultarTinyLlama(prompt) {
    const response = await axios.post(
        this.tinyllamaUrl,
        {
            model: 'tinyllama',
            prompt,
            stream: false,
        },
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );
    // Extraer solo los datos necesarios de la respuesta
    console.log({ response: response.data.response });
    return { response: response.data.response };
}


}

module.exports = Logic;
