function isRelevant(text) {
    const include = ["ai", "ml", "mlops", "rag", "llm", "devops"];
    const exclude = ["sale", "offer", "webinar", "course", "marketing"];

    if (exclude.some(k => text.includes(k))) return false;
    return include.some(k => text.includes(k));
}

function getPriority(text) {
    if (/mlops|rag|llm|kubernetes/.test(text)) return "HIGH";
    if (/ai|ml/.test(text)) return "MEDIUM";
    return "LOW";
}

function getScore(text) {
    let score = 0;

    if (/mlops|rag|llm/.test(text)) score += 40;
    if (/kubernetes|docker/.test(text)) score += 30;
    if (/python/.test(text)) score += 20;

    return score;
}

module.exports = { isRelevant, getPriority, getScore };
