// source: https://github.com/adno/wikipedia-word-frequency-clean/blob/main/results/enwiki-frequency-20221020-lower.tsv.xz

import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import lzma from 'lzma-native';
import csvParser from 'csv-parser';
import path from 'path';
import zlib from 'zlib';

// const words = require('../data/en-frequency.json');

const filePath = 'src/data/en-frequency';
const tsvFilePath = `${filePath}.tsv.xz`;
const decompressedFilePath = `${filePath}.tsv`;

const decompressFile = (inputPath, outputPath) =>
  new Promise((resolve, reject) => {
    fsSync
      .createReadStream(inputPath)
      .pipe(lzma.createDecompressor())
      .pipe(fsSync.createWriteStream(outputPath))
      .on('finish', resolve(outputPath))
      .on('error', reject);
  });

const tsvJSON = (tsv) => {
  const lines = tsv.split('\n');
  const result = [];
  const headers = lines[0].split('\t');

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split('\t');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  return result;
};

const processTsvXzFile = async () => {
  try {
    const tsvFileData = fsSync.readFileSync(decompressedFilePath);
    const jsonResult = tsvJSON(tsvFileData.toString());
    console.log({ jsonResult });
    return jsonResult;
  } catch (error) {
    console.error('Error processing TSV.XZ file:', error);
  }
};

// (async () => await processTsvXzFile())();

const getSortedArray = async () => {
  const englishWordRegex = /^[a-zA-Z]+$/;

  const largeArray = await processTsvXzFile(tsvFilePath);

  console.log({ arr: largeArray, isArray: Array.isArray(largeArray) });

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

  fsSync.writeFile(
    jsonFileName,
    JSON.stringify(sortedWords, null, 2),
    (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log(`File successfully written to ${jsonFileName}`);
      }
    }
  );
};

// (async () => await getSortedArray())();

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

  const outputFilePath = './src/data/words.json';

  fs.writeFile(outputFilePath, JSON.stringify(result, null, 2), (err) => {
    if (err) {
      console.error('Error writing the JSON file:', err);
      return;
    }
    console.log(`File successfully written to ${outputFilePath}`);
  });
};

// wordArrToObj(words);

async function processWordsFile() {
  try {
    const __dirname = process.cwd();
    const filePath = path.join(__dirname, 'src', 'data', 'en-frequency.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    const wordsArray = Object.entries(jsonData.words).slice(0, 200000);

    const sortedWordsArray = wordsArray.sort(([keyA], [keyB]) =>
      keyA.localeCompare(keyB)
    );

    const chunkSize = Math.ceil(sortedWordsArray.length / 15);
    const chunks = [];

    for (let i = 0; i < sortedWordsArray.length; i += chunkSize) {
      const chunk = sortedWordsArray.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const firstWord = chunk[0][0];
      const lastWord = chunk[chunk.length - 1][0];
      const firstTwoLettersFirstWord = firstWord.slice(0, 2);
      const firstTwoLettersLastWord = lastWord.slice(0, 2);
      const chunkFileName = `${firstTwoLettersFirstWord}-${firstTwoLettersLastWord}.json.gz`;
      const chunkObject = Object.fromEntries(chunk);
      const jsonChunk = JSON.stringify(chunkObject, null, 2);
      const compressedChunk = zlib.gzipSync(jsonChunk);

      const chunkFilePath = path.join(__dirname, 'src', 'data', chunkFileName);
      await fs.writeFile(chunkFilePath, compressedChunk);
      console.log(`Compressed chunk written to ${chunkFilePath}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function longestWord() {
  try {
    const __dirname = process.cwd();
    const filePath = path.join(__dirname, 'src', 'data', 'words.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    const wordsArray = Object.entries(jsonData.words).slice(0, 200000);

    const sortedWordsArray = wordsArray.sort(([keyA], [keyB]) =>
      keyA.localeCompare(keyB)
    );

    const maxWordLength = sortedWordsArray.reduce(
      (maxLength, [key]) => Math.max(maxLength, key.length),
      0
    );

    console.log('Max word length:', maxWordLength);
  } catch (error) {
    console.error('Error processing words file:', error);
  }
}

// (async () => await processWordsFile())();

async function processWordsFileReverseIndex() {
  try {
    const __dirname = process.cwd();
    const filePath = path.join(__dirname, 'data', 'en-frequency.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    const wordsArray = jsonData.slice(0, 200000);

    const length = wordsArray.length;
    const reverseIndexedWordsArray = wordsArray.map((word, index) => {
      return [word, length - index - 1];
    });

    console.log({ reverseIndexedWordsArray });

    const sortedWordsArray = reverseIndexedWordsArray.sort(([keyA], [keyB]) =>
      keyA.localeCompare(keyB)
    );

    const chunkSize = Math.ceil(sortedWordsArray.length / 15);
    const chunks = [];

    for (let i = 0; i < sortedWordsArray.length; i += chunkSize) {
      const chunk = sortedWordsArray.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const firstWord = chunk[0][0];
      const lastWord = chunk[chunk.length - 1][0];
      const firstTwoLettersFirstWord = firstWord.slice(0, 2);
      const firstTwoLettersLastWord = lastWord.slice(0, 2);
      const chunkFileName = `${firstTwoLettersFirstWord}-${firstTwoLettersLastWord}.json.gz`;
      const chunkObject = Object.fromEntries(chunk);
      const jsonChunk = JSON.stringify(chunkObject, null, 2);
      const compressedChunk = zlib.gzipSync(jsonChunk);

      const chunkFilePath = path.join(__dirname, 'src', 'data', chunkFileName);
      await fs.writeFile(chunkFilePath, compressedChunk);
      console.log(`Compressed chunk written to ${chunkFilePath}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

(async () => await processWordsFileReverseIndex())();
