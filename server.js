const express = require('express');
const axios = require('axios');
require('dotenv').config();

//Swagger integration
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

/* Below code is required to store code in file format 
const fs = require('fs');
const path = require('path');
*/

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Swagger setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const PORT = process.env.PORT || 3000;
const azureKey = process.env.AZURE_KEY; 
const azureEndpoint = `${process.env.AZURE_ENDPOINT}cognitiveservices/v1`;

app.get('/', (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Azure Text to Speech (TTS) API</title>
      </head>
      <body>
        <h1> System Integration Final Project Spring '24</h1>
        <h2>Welcome to Azure Text to Speech (TTS) API</h2>
      </body>
    </html>
  `;
  res.send(htmlContent);
}); 

app.get('/malespeech', (req, res) => {
  const formHtml = `
      <html>
          <head>
            <title>Male Speech English</title>
            <link rel="stylesheet" href="style.css">
            <script>
              document.addEventListener('DOMContentLoaded', function() {
                const form = document.getElementById('speechForm');
                const statusText = document.getElementById('statusText');

                form.addEventListener('submit', function(event) {
                  event.preventDefault();
                  const text = document.getElementById('text').value;
                  statusText.textContent = "Processing..."; 
                  statusText.style.color = "black"; 

                  fetch('/malespeech', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: text })
                  })
                  .then(response => response.blob())
                  .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const audioElement = document.getElementById('audioOutput');
                    audioElement.src = url;
                    audioElement.autoplay = true; 
                    statusText.textContent = "Audio ready to play!";
                    statusText.style.color = "green"; 
                  })
                  .catch(err => {
                    console.error('Error:', err);
                    statusText.textContent = "Error loading audio.";
                    statusText.style.color = "red";
                  });
                });
              });
            </script>
          </head>
          <body>
              <div class="container">
                <h1>Male English TTS</h1>
                <form id="speechForm">
                  <input type="text" id="text" name="text" placeholder="Enter text here..." required>
                  <button type="submit">Convert Text To Speech</button>
                </form>
                <audio id="audioOutput" controls></audio>
                <p id="statusText">Enter text and convert.</p>
              </div>
          </body>
      </html>
  `;
  res.send(formHtml);
});


app.post('/malespeech', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: "Text is required in the request body." });
    }
   
    const config = {
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm' 
        },
        responseType: 'arraybuffer'
      };
      
      const ssml = `<speak version='1.0' xml:lang='en-US'>
                      <voice xml:lang='en-US' xml:gender='Male' name='en-US-GuyNeural'>
                          ${text}
                      </voice>
                    </speak>`;

    try {
        //const response = await axios.post(azureEndpoint, ssml, config, { responseType: 'arraybuffer' });  
        const response = await axios.post(azureEndpoint, ssml, config);
        
        const audioBuffer = Buffer.from(response.data, 'binary');
        
        //fs.writeFileSync('output.wav', audioBuffer);
        //res.send('Audio file generated successfully!');
        
        res.writeHead(200, {
          'Content-Type': 'audio/wav',
          'Content-Length': audioBuffer.length
        });
        res.end(audioBuffer);
    } catch (error) {
      console.error('Full Error:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        res.status(error.response.status).json({
          message: 'Failed to convert text to speech using Azure API',
          details: error.response.data,
          status: error.response.status
        });
      } else if (error.request) {
        console.error('Error request:', error.request);
        res.status(500).json({
          message: 'No response received from Azure API',
          details: 'The Azure API did not respond in a timely manner'
        });
      } else {
        console.error('Error setting up the request:', error.message);
        res.status(500).json({
          message: 'Error setting up the request to Azure API',
          details: error.message
        });
      }
    }
  });

  app.get('/femalespeech', (req, res) => {
    const formHtml = `
        <html>
            <head>
              <title>Female English Speech</title>
              <link rel="stylesheet" href="style.css">
              <script>
                document.addEventListener('DOMContentLoaded', function() {
                  const form = document.getElementById('speechForm');
                  const statusText = document.getElementById('statusText');
  
                  form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const text = document.getElementById('text').value;
                    statusText.textContent = "Processing..."; 
                    statusText.style.color = "black"; 
  
                    fetch('/femalespeech', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ text: text })
                    })
                    .then(response => response.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const audioElement = document.getElementById('audioOutput');
                      audioElement.src = url;
                      audioElement.autoplay = true; // Set autoplay to true
                      statusText.textContent = "Audio ready to play!";
                      statusText.style.color = "green"; 
                    })
                    .catch(err => {
                      console.error('Error:', err);
                      statusText.textContent = "Error loading audio.";
                      statusText.style.color = "red";
                    });
                  });
                });
              </script>
            </head>
            <body>
                <div class="container">
                  <h1>Female English TTS</h1>
                  <form id="speechForm">
                    <input type="text" id="text" name="text" placeholder="Enter text here..." required>
                    <button type="submit">Convert Text To Speech</button>
                  </form>
                  <audio id="audioOutput" controls></audio>
                  <p id="statusText">Enter text and convert.</p>
                </div>
            </body>
        </html>
    `;
    res.send(formHtml);
  });
  

app.post('/femalespeech', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: "Text is required in the request body." });
    }
   
    const config = {
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm' 
        },
        responseType: 'arraybuffer'
      };
      
      const ssml = `<speak version='1.0' xml:lang='en-US'>
                      <voice xml:lang='en-US' xml:gender='Feale' name='en-US-JessaNeural'>
                          ${text}
                      </voice>
                    </speak>`;

    try {
        const response = await axios.post(azureEndpoint, ssml, config);
        
        const audioBuffer = Buffer.from(response.data, 'binary');
        
        res.writeHead(200, {
          'Content-Type': 'audio/wav',
          'Content-Length': audioBuffer.length
        });
        res.end(audioBuffer);
    } catch (error) {
      console.error('Full Error:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        res.status(error.response.status).json({
          message: 'Failed to convert text to speech using Azure API',
          details: error.response.data,
          status: error.response.status
        });
      } else if (error.request) {
        console.error('Error request:', error.request);
        res.status(500).json({
          message: 'No response received from Azure API',
          details: 'The Azure API did not respond in a timely manner'
        });
      } else {
        console.error('Error setting up the request:', error.message);
        res.status(500).json({
          message: 'Error setting up the request to Azure API',
          details: error.message
        });
      }
    }
  });

  app.get('/femalespanish', (req, res) => {
    const formHtml = `
        <html>
            <head>
              <title>Female Spanish Speech</title>
              <link rel="stylesheet" href="style.css">
              <script>
                document.addEventListener('DOMContentLoaded', function() {
                  const form = document.getElementById('speechForm');
                  const statusText = document.getElementById('statusText');
  
                  form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    const text = document.getElementById('text').value;
                    statusText.textContent = "Processing..."; 
                    statusText.style.color = "black"; 
  
                    fetch('/femalespanish', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ text: text })
                    })
                    .then(response => response.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const audioElement = document.getElementById('audioOutput');
                      audioElement.src = url;
                      audioElement.autoplay = true;
                      statusText.textContent = "Audio ready to play!";
                      statusText.style.color = "green";
                    })
                    .catch(err => {
                      console.error('Error:', err);
                      statusText.textContent = "Error loading audio.";
                      statusText.style.color = "red"; 
                    });
                  });
                });
              </script>
            </head>
            <body>
                <div class="container">
                  <h1>Female Spanish TTS</h1>
                  <form id="speechForm">
                    <input type="text" id="text" name="text" placeholder="Enter text here..." required>
                    <button type="submit">Convert Text To Speech</button>
                  </form>
                  <audio id="audioOutput" controls></audio>
                  <p id="statusText">Enter text and convert.</p>
                </div>
            </body>
        </html>
    `;
    res.send(formHtml);
  });
app.post('/femalespanish', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: "Text is required in the request body." });
    }
   
    const config = {
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm' 
        },
        responseType: 'arraybuffer'
      };
      
      const ssml = `<speak version='1.0' xml:lang='en-US'>
                      <voice xml:lang='es-ES' xml:gender='Female' name='es-ES-HelenaNeural'>
                        <prosody rate="-10%" pitch="+10%">
                            ${text}
                        </prosody>
                      </voice>
                    </speak>`;

    try {
        const response = await axios.post(azureEndpoint, ssml, config);
        
        const audioBuffer = Buffer.from(response.data, 'binary');
        
        res.writeHead(200, {
          'Content-Type': 'audio/wav',
          'Content-Length': audioBuffer.length
        });
        res.end(audioBuffer);
    } catch (error) {
      console.error('Full Error:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        res.status(error.response.status).json({
          message: 'Failed to convert text to speech using Azure API',
          details: error.response.data,
          status: error.response.status
        });
      } else if (error.request) {
        console.error('Error request:', error.request);
        res.status(500).json({
          message: 'No response received from Azure API',
          details: 'The Azure API did not respond in a timely manner'
        });
      } else {
        console.error('Error setting up the request:', error.message);
        res.status(500).json({
          message: 'Error setting up the request to Azure API',
          details: error.message
        });
      }
    }
  });


app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/`);
  console.log("Making API call to:", azureEndpoint);
});
