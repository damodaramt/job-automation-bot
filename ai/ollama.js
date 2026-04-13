const axios = require("axios");

async function askAI(prompt) {
    try {
        const res = await axios.post(
            "http://127.0.0.1:11434/api/generate",
            {
                model: "llama3",
                prompt: `You are a job assistant.
Give short decision: APPLY or SKIP with reason.

Job:
${prompt}`,
                stream: false
            },
            {
                timeout: 4000
            }
        );

        const output = res.data?.response;

        if (!output) return "Apply if relevant";

        return output.trim();

    } catch (err) {
        return "Good match";
    }
}

module.exports = { askAI };
