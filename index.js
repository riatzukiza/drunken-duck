const extractEntitiesFromSearch = require('./src/extract-entities-from-search');

// List of search terms likely to contain ready-to-drink alcoholic beverages
const searchTerms = ['cocktails', 'canned cocktails', 'bottled cocktails', 'ready to drink alcoholic beverages'];
const classLabels = ['premixed alcoholic beverage brands', 'distributor', 'manufacturer'];

async function isObjectLikelyValid(entities) {
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
        You are a natural language classifying and processing system.
        You input and out put json data.
        You accept a json object with 3 keys: 
          'brand','distributor','manufacturer'.
        Where 
          brand is a string likely containing a brand of a premixed alcoholic beverage,
          distributor is a string likely containing a distributor of a premixed alcoholic beverage,
          manufacturer is a string likely containing a manufacturer of a premixed alcoholic beverage.
        You output an object with a two keys: 'valid', 'confidence'.
        The type of the value of the 'valid' key is a boolean.
        The type of the value of the 'confidence' key is a float between 0 and 1.
        It is a measure of how confident you are that the 'valid' key is correct.
        Your objective is to determine is if the brand is affiliated 
          with both the manufacture and distributor.
        That means the 'premixed alcoholic beverages brands' key is a brand of 
          drink that is distributed and manufactured by the distributor and manufacturer 
          named in the object.
        If the brand is affiliated with both the manufacture and distributor,
          then the 'valid' key should be true.
        If the brand is not affiliated with both the manufacture and distributor,
          then the 'valid' key should be false.
        If you are not confident in your determination,
          then the 'confidence' key should be low.
        If you are confident in your determination,
          then the 'confidence' key should be high.
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
// Function to generate combinations of brand, manufacturer, and distributor names
async function generateCombinations(brandNames, manufacturerNames, distributorNames) {
  const combinations = [];
  for (const brand of brandNames) {
    for (const manufacturer of manufacturerNames) {
      for (const distributor of distributorNames) {
        const combination = { brand, manufacturer, distributor };
        if (isObjectLikelyValid(combination)) {
          combination.push(combination);
        }
      }
    }
  }
  return combinations;
}
async function searchEntities() {
  const results = {};
  for (const label of classLabels) {
    results[label] = [];
    for (const term of searchTerms) {
      const entities = await extractEntitiesFromSearch(term, label);
      results[label].push(entities);
    }
  }

  // Flatten the array of arrays of entities into a single array of entities
  for (const resultKey of Object.keys(results)) {
    results[resultKey] = [...new Set(results[resultKey].flat())];
  }

  // Generate combinations of brand, manufacturer, and distributor names
  const brandNames = results[classLabels[0]];
  const manufacturerNames = results[classLabels[1]];
  const distributorNames = results[classLabels[2]];
  const combinations = await generateCombinations(brandNames, manufacturerNames, distributorNames);
  console.log(combinations)
}

searchEntities().catch(error => {
  console.error('An error occurred:', error);
});