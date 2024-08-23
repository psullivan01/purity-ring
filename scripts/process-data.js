// source: https://github.com/adno/wikipedia-word-frequency-clean/blob/main/results/enwiki-frequency-20221020-lower.tsv.xz

const fs = require('fs');
const lzma = require('lzma-native');
const csvParser = require('csv-parser');

const words = require('../data/en-frequency.json');

const filePath = 'data/en-frequency';
const tsvFilePath = `../${filePath}.tsv.xz`;
const decompressedFilePath = `../${filePath}.tsv`;

const decompressFile = (inputPath, outputPath) =>
  new Promise((resolve, reject) => {
    fs.createReadStream(inputPath)
      .pipe(lzma.createDecompressor())
      .pipe(fs.createWriteStream(outputPath))
      .on('finish', resolve)
      .on('error', reject);
  });

const parseTsvToJson = (filePath) =>
  new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: '\t' }))
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', reject);
  });

const processTsvXzFile = async () => {
  try {
    const filePath = decompressFile(tsvFilePath, decompressedFilePath);
    const jsonResult = await parseTsvToJson(filePath);
    return jsonResult;
  } catch (error) {
    console.error('Error processing TSV.XZ file:', error);
  }
};

const getSortedArray = async () => {
  const englishWordRegex = /^[a-zA-Z]+$/;

  const largeArray = await processTsvXzFile(tsvFilePath);

  const { filteredArray, counts, documents } = largeArray.reduce(
    (acc, item) => {
      if (englishWordRegex.test(item.word)) {
        acc.filteredArray.push(item);
        acc.counts.push(parseInt(item.count));
        acc.documents.push(parseInt(item.documents));
      }
      return acc;
    },
    { filteredArray: [], counts: [], documents: [] }
  );

  const sortedIndices = Array.from(counts.keys()).sort((a, b) => {
    if (counts[a] !== counts[b]) {
      return counts[b] - counts[a];
    } else if (documents[a] !== documents[b]) {
      return documents[b] - documents[a];
    } else {
      return filteredArray[a].word.localeCompare(filteredArray[b].word);
    }
  });

  const sortedWords = sortedIndices.map((i) => filteredArray[i].word);

  const jsonFileName = 'en-frequency.json';
  fs.writeFile(jsonFileName, JSON.stringify(sortedWords, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log(`File successfully written to ${jsonFileName}`);
    }
  });
};

// getSortedArray();

// Function to read .txt file and convert to .json
const txtToJson = (inputFilePath, outputFilePath) => {
  fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    const lines = data.split(/\r?\n/).filter((line) => line.trim() !== '');

    const jsonArray = lines;

    fs.writeFile(outputFilePath, JSON.stringify(jsonArray, null, 2), (err) => {
      if (err) {
        console.error('Error writing the JSON file:', err);
        return;
      }
      console.log(`File successfully written to ${outputFilePath}`);
    });
  });
};

// txtToJson('./data/blacklist.txt', './src/blacklist.json');

const wordArrToObj = (words) => {
  const wordsLength = words.length;
  const result = words.reduce(
    (acc, word, i) => {
      acc.words[word] = Math.log((i + 1) * Math.log(wordsLength));
      acc.maxWordLength = Math.max(acc.maxWordLength, word.length);

      return acc;
    },
    { maxWordLength: 0, words: {} }
  );

  const outputFilePath = './src/words.json';

  fs.writeFile(outputFilePath, JSON.stringify(result, null, 2), (err) => {
    if (err) {
      console.error('Error writing the JSON file:', err);
      return;
    }
    console.log(`File successfully written to ${outputFilePath}`);
  });
};

// wordArrToObj(words);
