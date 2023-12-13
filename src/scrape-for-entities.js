// const { NlpManager } = require('node-nlp');
const OpenAI = require('openai');

const openai = new OpenAI({});

// Initialize NLP manager
// const manager = new NlpManager({ languages: ['en'] });

async function filterEntitiesByClass(entities, targetClass) {
    const batchSize = 100; // Adjust this value based on your needs
    const batches = [];
    while (entities.length) {
        let batch = entities.splice(0, batchSize);
        batches.push(batch);
    }

    const filteredEntities = [];
    for (const batch of batches) {
        const prompt = JSON.stringify({ tokens: batch, targetClass });
        console.log(prompt)
        const response = await openai.chat.completions.create({
            messages: [{
                role: "system",
                content: `
                you are a word classifying and processing system. 
                Your input is a JSON object with two keys: tokens and targetClass.
                You output valid  JSON.
                Tokens is a JSON array of tokens.
                Tokens are nouns filtered from a web page.
                targetClass is a string.
                targetClass is the class of tokens you want to filter.
                A class is a string representing a category of tokens.
                An example of a class is "alcohol".
                An example of an input is {"tokens": ["water","potatos","beer", "wine", "vodka"], "targetClass": "alcohol"}.
                An example of an output is ["beer", "wine", "vodka"].
                Water and potatos were filtered out because they do not belong to the alcohol class.
                beer, wine, and vodka were kept because they belong to the alcohol class.
                `
            }, { role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });
        try {
            console.log({ choices: response.choices[0].message })
            const batchFilteredEntities = JSON.parse(response.choices[0].message.content.trim());
            console.log({ batchFilteredEntities })

            filteredEntities.push(...batchFilteredEntities);
        } catch (error) {
            console.error(error)
        }
    }

    return filteredEntities;
}
const cheerio = require('cheerio');
const nlp = require('compromise');
// Function to scrape and process a web page for named entities
module.exports = async function scrapeForEntities(text, targetClass) {
    console.log("filtering entities", { text, targetClass });

    const $ = cheerio.load(text);
    const textContent = $('body').text();
    const doc = nlp(textContent);
    const entities = doc.match('#Noun').out('array');
    console.log({ entities })

    // Filter entities using GPT-3.5 API
    const filteredEntities = await filterEntitiesByClass(entities, targetClass);
    return filteredEntities;
}
