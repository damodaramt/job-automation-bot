const axios = require('axios');

async function askAI(prompt) {
    try {
        const res = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3',
            prompt: prompt,
            stream: false
        });

        return res.data.response;
    } catch (err) {
        return "⚠️ AI not responding";
    }
}

module.exports = { askAI };
