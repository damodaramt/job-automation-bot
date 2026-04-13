const resume = require("./resume.json");

function normalize(text) {
    return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function matchScore(text) {
    if (!text) return 0;

    text = normalize(text);
    let score = 0;

    // 🎯 Role matching
    if (text.includes("ai engineer")) score += 50;
    else if (text.includes("machine learning engineer")) score += 45;
    else if (text.includes("ml engineer")) score += 40;
    else if (text.includes("data scientist")) score += 35;

    // 🧠 Core AI keywords
    if (text.includes("ai")) score += 10;
    if (text.includes("machine learning")) score += 15;
    if (text.includes("llm")) score += 20;
    if (text.includes("rag")) score += 20;

    // 🛠 Resume skills
    resume.skills.forEach(skill => {
        if (text.includes(normalize(skill))) score += 5;
    });

    // 🚀 Priority keywords
    resume.priority_keywords.forEach(k => {
        if (text.includes(normalize(k))) score += 10;
    });

    // ❌ Ignore keywords
    resume.ignore_keywords.forEach(k => {
        if (text.includes(normalize(k))) score -= 50;
    });

    return Math.max(0, Math.min(score, 100));
}

function getPriority(score) {
    if (score >= 75) return "🔥 APPLY_NOW";
    if (score >= 60) return "⚡ HIGH";
    if (score >= 40) return "📊 MEDIUM";
    return "❌ IGNORE";
}

module.exports = { matchScore, getPriority };
