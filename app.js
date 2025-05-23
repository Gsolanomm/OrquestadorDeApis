const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 4000;

const tinyllamaUrl = 'http://localhost:11434/api/generate';
const apiUrl = 'http://localhost:5000';

app.use(express.json()); 



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


async function obtenerDocumentos() {
  try {
    const response = await axios.get(`${apiUrl}/documentos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener documentos:", error.message);
    return null;
  }
}



// Endpoint: pregunta con coincidencia en documentos o mensaje si no hay
app.post('/api/preguntarDocumentos', async (req, res) => {
  const { pregunta } = req.body;
  if (!pregunta) {
    return res.status(400).json({ error: 'Falta el campo pregunta' });
  }

  try {
    const documentos = await obtenerDocumentos();
    if (!documentos || !Array.isArray(documentos)) {
      return res.status(500).json({ error: 'No se pudieron obtener documentos' });
    }

    // Filtrar documentos que contengan palabras clave de la pregunta
    const preguntaLower = pregunta.toLowerCase();
    const documentosRelacionados = documentos.filter(doc =>
      doc.contenido && doc.contenido.toLowerCase().includes(preguntaLower)
    );

    if (documentosRelacionados.length === 0) {
      return res.json({ mensaje: 'No hay documentos relacionados con la pregunta.' });
    }

    // Concatenar contenido para usar como contexto
    const contexto = documentosRelacionados.map(d => d.contenido).join('\n---\n');
    const prompt = `Responde basándote en estos documentos:\n${contexto}\nPregunta: ${pregunta}`;

    // Consultar TinyLlama
    const response = await axios.post(
      tinyllamaUrl,
      {
        model: 'tinyllama',
        prompt,
        stream: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return res.json({ respuesta: response.data.response });
  } catch (error) {
    console.error("Error al procesar la pregunta:", error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});





// Endpoint que solo pregunta a TinyLlama directamente sin contexto ni nada más
app.post('/api/soloia', async (req, res) => {
  const { pregunta } = req.body;
  if (!pregunta) {
    return res.status(400).json({ error: 'Falta el campo pregunta' });
  }

  try {
    const response = await axios.post(
      tinyllamaUrl,
      {
        model: 'tinyllama',
        prompt: pregunta,
        stream: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return res.json({ respuesta: response.data.response });
  } catch (error) {
    console.error("Error al consultar a TinyLlama:", error.message);
    return res.status(500).json({ error: 'Error al consultar a TinyLlama' });
  }
});

