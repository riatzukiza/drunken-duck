// const axios = require('axios');
// const cheerio = require('cheerio');

// module.exports = async function retrieveSearchText(searchTerm) {
//     const response = await axios.get(`https://duckduckgo.com/html/?q=${encodeURIComponent(searchTerm)}`);

//     const $ = cheerio.load(response.data);
//     const links = $('a.result__url').map((_, link) => $(link).attr('href')).get();

//     const textPromises = links.map(async link => {
//         const response = await axios.get(link);
//         const $ = cheerio.load(response.data);
//         return $('body').text();
//     });

//     const texts = await Promise.all(textPromises);

//     return texts;
// }
// module.exports = function retrieveSearchText(searchTerm) {
//     return googleThis.search(searchTerm)
//         .then((result) => {
//             console.log(result);
//             const { items } = result;
//             // Map each result to a promise that resolves to the text content of the page
//             const textPromises = items.map(item => {
//                 return axios.get(item.link)
//                     .then(response => {
//                         const $ = cheerio.load(response.data);
//                         return $('body').text();
//                     });
//             });

//             // Wait for all promises to resolve and return the resulting array of text contents
//             return Promise.all(textPromises);
//         });
// }

// module.exports = async function retrieveSearchText(searchTerm) {
//     const response = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`);

//     const $ = cheerio.load(response.data);
//     const links = $('li.b_algo h2 a').map((_, link) => $(link).attr('href')).get();

//     const textPromises = links.map(async link => {
//         const response = await axios.get(link);
//         const $ = cheerio.load(response.data);
//         return $('body').text();
//     });

//     const texts = await Promise.all(textPromises);

//     return texts;
// // }
// const axios = require('axios');
// const cheerio = require('cheerio');

// module.exports = async function retrieveSearchText(searchTerm) {
//     const response = await axios.get(`https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`);

//     const $ = cheerio.load(response.data);
//     const links = $('li.b_algo h2 a').map((_, link) => $(link).attr('href')).get();

//     const textPromises = links.slice(0, 10).map(async link => {
//         try {
//             const response = await axios.get(link);
//             const $ = cheerio.load(response.data);
//             return $('body').text();
//         } catch (error) {
//             console.error(`Failed to fetch ${link}: ${error.message}`);
//             return '';
//         }
//     });

//     const texts = await Promise.all(textPromises);

//     return texts;
// }
const googleIt = require('google-it');
const axios = require('axios');
const htmlToText = require('html-to-text');

module.exports = async function retrieveSearchText(searchTerm) {
    const results = await googleIt({ query: searchTerm });
    // console.log({ results });

    const texts = [];
    for (const result of results) {
        try {
            const response = await axios.get(result.link);
            // console.log({ data: response.data })
            const text = htmlToText.convert(response.data, {
                wordwrap: false
            });
            texts.push(text);
        } catch (error) {
            console.error(`Failed to fetch ${result.link}: ${error.message}`);
        }
    }
    return texts;
}