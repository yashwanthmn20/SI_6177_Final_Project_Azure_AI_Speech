const express = require('express');
const axios = require('axios');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const azureKey = process.env.AZURE_KEY; 
const azureEndpoint = `${process.env.AZURE_ENDPOINT}cognitiveservices/v1`;

app.get('/', (req, res) => {
  res.send('Welcome to Azure Text to Speech API');
});

app.post('/tospeech', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: "Text is required in the request body." });
    }
   
    const config = {
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm' // Changed to 24 kHz mono
        },
        responseType: 'arraybuffer'
      };
      
      const ssml = `<speak version='1.0' xml:lang='en-US'>
                      <voice xml:lang='en-US' xml:gender='Male' name='en-US-GuyNeural'>
                          ${text}
                      </voice>
                    </speak>`;

    try {
        const response = await axios.post(azureEndpoint, ssml, config, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data, 'binary');
        fs.writeFileSync('output.wav', audioBuffer);
        res.send('Audio file generated successfully!');
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
  console.log(`Server running on port ${PORT}`);
  console.log("Making API call to:", azureEndpoint);
});