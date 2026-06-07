import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import { createGateway, generateText } from 'ai';

const app = express();
const port = process.env.PORT || 3000;

function normalizeOrigin(origin) {
    return origin?.replace(/\/$/, '') ?? '';
}

function isAllowedOrigin(origin) {
    if (!origin) return true;

    const normalized = normalizeOrigin(origin);

    const localOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    if (localOrigins.includes(normalized)) return true;

    const clientUrl = normalizeOrigin(process.env.CLIENT_URL);
    if (clientUrl && normalized === clientUrl) return true;

  
    if (/^https:\/\/[\w.-]+\.vercel\.app$/i.test(normalized)) return true;

    return false;
}

const corsOptions = {
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, origin || true);
            return;
        }
        console.warn('CORS blocked origin:', origin);
        callback(null, false);
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

const gateway = createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
});

const aiModel = gateway('google/gemini-2.5-flash');

function parseAiDescription(text) {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    return JSON.parse(cleaned);
}

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 20 },
    genre: { type: String, required: true },
    description: { type: String, required: true, maxlength: 200 },
});

const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI).then(m => {
            console.log('* Mongo connected');
            return m;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Mongo error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

function validateMovie({ title, genre, description }) {
    if (!title?.trim()) {
        return 'Movie title is required';
    }
    if (title.trim().length > 20) {
        return 'Movie title must be at most 20 characters';
    }
    if (!genre?.trim()) {
        return 'Genre is required';
    }
    if (!description?.trim()) {
        return 'Description is required';
    }
    if (description.length > 200) {
        return 'Description must be at most 200 characters';
    }
    return null;
}

app.get('/movies', (req, res) => {
    Movie.find()
        .then(movies => res.json(movies))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/movies', (req, res) => {
    const { title, genre, description } = req.body;
    const validationError = validateMovie({ title, genre, description });

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    Movie.create({
        title: title.trim(),
        genre: genre.trim(),
        description: description.trim(),
    })
        .then(movie => res.status(201).json(movie))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/movies/:id', (req, res) => {
    Movie.findByIdAndDelete(req.params.id)
        .then(movie => {
            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }
            res.json({ message: 'Movie deleted' });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/movies/search', (req, res) => {
    const name = req.query.name || '';

    Movie.find({ title: { $regex: name, $options: 'i' } })
        .then(movies => res.json(movies))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/movies/generate', async (req, res) => {
    try {
        const { title, genre } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ error: 'Movie title is required' });
        }
        if (title.trim().length > 20) {
            return res.status(400).json({ error: 'Movie title must be at most 20 characters' });
        }
        if (!genre?.trim()) {
            return res.status(400).json({ error: 'Genre is required' });
        }

        const { text } = await generateText({
            model: aiModel,
            prompt: `Write a short movie description (max 200 characters) for a movie titled "${title.trim()}" in the "${genre.trim()}" genre. Respond ONLY with valid JSON in this exact format: {"description": "your description here"}`,
        });

        const parsed = parseAiDescription(text);

        if (!parsed.description || parsed.description.length > 200) {
            return res.status(500).json({ error: 'Invalid AI response format' });
        }

        res.json({ description: parsed.description });
    } catch (error) {
        console.error('AI generate error:', error);
        res.status(500).json({ error: 'Error generating description from AI' });
    }
});

export default app;

if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`server running on port ${port}`);
    });
}
