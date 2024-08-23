// source: https://en.wikipedia.org/wiki/Leet
const https = require('https');
const { writeJsonFile } = require('../src/helpers/helpers.js');

const url = 'https://en.wikipedia.org/wiki/Leet';

https
  .get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const tableMatch = data.match(
        /<table class="wikitable"[^>]*>([\s\S]*?)<\/table>/
      );

      if (tableMatch) {
        const tableHTML = tableMatch[1];
        const result = {};

        const thMatches = tableHTML.match(/<th[^>]*>([\s\S]*?)<\/th>/g);

        if (thMatches) {
          thMatches.forEach((thMatch, index) => {
            const tds = [];
            let tdMatch;

            const key = thMatch
              .replace(/<[^>]*>/g, '')
              .trim()
              .toLowerCase(); // Convert key to lowercase
            result[key] = []; // Initialize with an empty array

            const tdRegex = new RegExp(`<td[^>]*>([\\s\\S]*?)<\/td>`, 'g');

            while ((tdMatch = tdRegex.exec(tableHTML)) !== null) {
              tds.push(tdMatch[1]);
            }

            if (tds[index]) {
              const codeMatches = tds[index].match(
                /<code[^>]*>([\s\S]*?)<\/code>/g
              );

              if (codeMatches) {
                codeMatches.forEach((codeMatch) => {
                  // Split the content by <br> tags to get individual entries
                  const parts = codeMatch
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .split(' ') // Split on space
                    .map((part) => part.trim()) // Trim whitespace
                    .filter((part) => part !== '' && !/[a-zA-Z]/.test(part)); // Remove empty entries and alphabetic characters

                  // Add each part to the result array for the current key
                  result[key] = parts;
                });
              }
            }
          });

          // Write the result to a JSON file
          writeJsonFile('./src/leet.json', result);
        }
      } else {
        console.log('Table not found');
      }
    });
  })
  .on('error', (err) => {
    console.error('Error fetching the page:', err.message);
  });
