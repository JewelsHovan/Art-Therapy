import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Configure dotenv to read .env file
dotenv.config();

// Set up Express
const app = express();
const port = process.env.PORT || 3000;

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                response_format: 'url'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate image');
        }

        const data = await response.json();
        res.json({ imageUrl: data.data[0].url });
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: error.message || 'Failed to generate image' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
