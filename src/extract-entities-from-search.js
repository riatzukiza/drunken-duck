const scrapeForEntities = require('./scrape-for-entities');
const memoize = require('memoizee');
const retrieveSearchText = memoize(require('./retrieve-search-text'), { promise: true });

module.exports = async function extractEntitiesFromSearch(searchTerm, targetClass) {
    console.log("extracting entities", { searchTerm, targetClass });
    const texts = await retrieveSearchText(searchTerm);
    const entities = [];

    for (const text of texts) {
        const entity = await scrapeForEntities(text, targetClass);
        entities.push(entity);
    }

    return entities;
}