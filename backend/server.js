
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ✅ API KEY DIRECTLY HARDCODED - YAHI SE KAAM KAREGA
const GROQ_API_KEY = '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';

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Using API Key:', GROQ_API_KEY.substring(0, 10) + '...');

    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error('Groq Error:', data.error);
            return res.status(400).json({ error: data.error.message });
        }

        const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
        res.json({ reply });
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ API Key loaded (hardcoded)`);
});