import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import db from './src/database.js';

// Configure dotenv and basic setup
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
// Add uploads to static middleware
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'images');
fs.mkdirSync(uploadsDir, { recursive: true });

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper function to download images
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }

            const writeStream = fs.createWriteStream(filepath);
            response.pipe(writeStream);

            writeStream.on('finish', () => {
                writeStream.close();
                resolve();
            });
        }).on('error', reject);
    });
}

// Modified image generation endpoint
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Generate image with DALL-E
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
        const imageUrl = data.data[0].url;
        
        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
        const localPath = path.join('uploads', 'images', filename);
        const fullPath = path.join(__dirname, localPath);

        // Download and save the image
        await downloadImage(imageUrl, fullPath);

        // Save to database
        db.run(
            'INSERT INTO images (prompt, file_path, dalle_url) VALUES (?, ?, ?)',
            [prompt, localPath, imageUrl],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to save image data' });
                }
                
                // Return both the served image path and the database ID
                res.json({ 
                    imageUrl: `/uploads/images/${filename}`,
                    id: this.lastID
                });
            }
        );

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({ error: error.message || 'Failed to generate image' });
    }
});

// Add an endpoint to fetch saved images
app.get('/api/images', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    db.all('SELECT * FROM images ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
        if (err) {
            console.error('Error fetching images:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Get total count for pagination
        db.get('SELECT COUNT(*) as count FROM images', [], (err, countRow) => {
            if (err) {
                console.error('Error getting count:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            const hasMore = offset + rows.length < countRow.count;
            res.json({
                images: rows,
                hasMore
            });
        });
    });
});

// Get all artwork
app.get('/api/artwork', (req, res) => {
    db.all('SELECT * FROM artwork ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching artwork:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
