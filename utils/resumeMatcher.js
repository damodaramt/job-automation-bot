const resume = require("./resume.json");

function normalize(text) {
    return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function matchScore(text) {
    if (!text) return 0;

    text = normalize(text);

    let score = 0;

    if (text.includes("ai engineer")) score += 40;
    else if (text.includes("machine learning engineer")) score += 40;
    else if (text.includes("ml engineer")) score += 35;

    if (text.includes("ai")) score += 15;
    if (text.includes("machine learning")) score += 20;

    resume.skills.forEach(s => {
        if (text.includes(normalize(s))) score += 5;
    });

    resume.priority_keywords.forEach(k => {
        if (text.includes(normalize(k))) score += 10;
    });

    resume.ignore_keywords.forEach(k => {
        if (text.includes(normalize(k))) score -= 40;
    });

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return score;
}

function getPriority(score) {
    if (score >= 70) return "APPLY_NOW";
    if (score >= 50) return "HIGH";
    if (score >= 30) return "MEDIUM";
    return "IGNORE";
}

module.exports = { matchScore, getPriority };
