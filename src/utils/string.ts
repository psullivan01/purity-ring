import sanitization from './sanitization.js';
import blacklistUtils from './blacklist.js';
import helpers from '../helpers/helpers.js';
import type { StringUtils } from './utils.types.d.ts';
import fsSync from 'fs';
import { Transform } from 'stream';
import zlib from 'zlib';
import path from 'path';

const stringUtils: StringUtils = {
  /**
   * The word cost object.
   */
  words: {},

  /**
   * The special blacklist object.
   */
  specialBlacklist: {},

  /**
   * The maximum word length from the dictionary of words.
   */
  maxWordLength: 29,

  /**
   * The number of words in the word frequency data. Because the data is chunked and not necessarily
   * included in the words object, this needs to remain a constant to calculate the offset index
   * for the special blacklist.
   */
  dictionaryLength: 200000,

  /**
   * The maximum cost value used as a fallback when a substring is not found in the words dictionary.
   * This ensures that unmatched substrings are penalized in cost-based calculations.
   */
  maxCost: 9e999,

  /**
   * The chunk filenames.
   */
  chunkManifest: [
    'a-ba',
    'ba-ca',
    'ca-cr',
    'cr-el',
    'el-ga',
    'ga-ho',
    'ho-kg',
    'kg-ma',
    'ma-my',
    'my-pa',
    'pa-re',
    're-se',
    'se-sw',
    'sw-ur',
    'ur-zz',
  ],

  /**
   * Gets the full file path for a given chunk name.
   */
  getChunkFilePath: (chunkName: string): string => {
    const dirname = helpers.getDirname();
    const filePath = path.resolve(dirname, `../data/${chunkName}.json.gz`);

    return filePath;
  },

  /**
   * Generates all possible consecutive substrings (permutations) from the input string.
   * Each substring starts from a specific index and expands until the end of the string.
   */
  getConsecutivePermutations: (inputString) =>
    Array.from(inputString).flatMap((_, i) =>
      Array.from({ length: inputString.length - i }, (_, j) =>
        inputString.slice(i, i + j + 1)
      )
    ),

  /**
   * Performs a binary search on the chunk manifest to determine to which chunk a given string belongs.
   * The search is based on the alphabetical range of the chunks defined in the chunk manifest.
   */
  chunkBinarySearch: (str) => {
    const { chunkManifest } = stringUtils;
    const lastIndex = chunkManifest.length - 1;

    let left = 0;
    let right = lastIndex;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const chunkName = chunkManifest[mid];
      const [start, end] = chunkName.split('-');
      const firstTwo = str.slice(0, 2);

      if (firstTwo > start && firstTwo < end) {
        return [chunkName];
      } else if (firstTwo === start) {
        const isBeginning = mid === 0;
        const boundaryChunk = chunkManifest[mid - 1];
        return isBeginning ? [chunkName] : [boundaryChunk, chunkName];
      } else if (firstTwo === end) {
        const isEnd = mid === lastIndex;
        const boundaryChunk = chunkManifest[mid + 1];
        return isEnd ? [chunkName] : [chunkName, boundaryChunk];
      } else if (firstTwo < start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return null;
  },

  /**
   * Streams data from a JSON chunk file and processes the data on the fly.
   * Extracted words matching the permutations are stored in the `words` object with their associated costs.
   */
  processChunkStream: async (filePath, permutationsArr) => {
    const { specialBlacklist, dictionaryLength } = stringUtils;
    const specialBlacklistLength = Object.keys(specialBlacklist).length;
    const wordsLength = dictionaryLength + specialBlacklistLength;

    const readStream = fsSync.createReadStream(filePath);
    const gunzipStream = zlib.createGunzip();

    let buffer = '';

    const processStream = new Transform({
      readableObjectMode: true,
      transform(chunk, _, callback) {
        buffer += chunk.toString();

        let boundary = buffer.lastIndexOf('}');

        if (boundary !== -1) {
          let jsonPart = buffer.slice(0, boundary + 1);

          buffer = buffer.slice(boundary + 1);

          const data = JSON.parse(jsonPart);

          const mergedData = { ...data, ...specialBlacklist };

          permutationsArr.forEach((permutation) => {
            const wordReverseIndex = mergedData[permutation];

            if (wordReverseIndex >= 0) {
              const actualIndex = wordsLength - wordReverseIndex;
              const cost = Math.log((actualIndex + 1) * Math.log(wordsLength));

              stringUtils.words[permutation] = cost;
            }
          });
        }

        callback();
      },
    });

    await new Promise((resolve, reject) => {
      readStream
        .pipe(gunzipStream)
        .pipe(processStream)
        .on('finish', resolve)
        .on('error', reject);
    });
  },

  /**
   * Prepares the special blacklist by fetching the list of special terms from the blacklist
   * and assigning a reverse index to each term. The reverse index starts after the
   * dictionary length to ensure unique indexing. These reverse-indexed terms are
   * stored in the `specialBlacklist` object, which is then used in cost-based string
   * splitting and word-matching.
   */
  prepareSpecialBlacklist: async () => {
    const { special } = await blacklistUtils.getBlacklist();

    const specialBlacklist = special.reduce<Record<string, number>>(
      (acc, curr, index) => {
        const reverseIndex = index + stringUtils.dictionaryLength;
        acc[curr] = reverseIndex;
        return acc;
      },
      {}
    );

    stringUtils.specialBlacklist = specialBlacklist;
  },

  /**
   * Fetches and processes all relevant JSON chunks for the input string.
   * The relevant chunks are determined based on the permutations of the input string.
   * The resulting word costs are stored in the `words` object.
   */
  fetchAndProcessChunks: async (inputString) => {
    const permutationsArr = stringUtils.getConsecutivePermutations(inputString);

    const chunks = Array.from(
      permutationsArr.reduce((acc, permutation) => {
        const chunkArr = stringUtils.chunkBinarySearch(permutation);

        if (chunkArr) {
          chunkArr.forEach((chunk) => acc.add(chunk));
        }

        return acc;
      }, new Set())
    );

    await stringUtils.prepareSpecialBlacklist();

    await Promise.all(
      chunks.map(async (chunkName) => {
        const filePath = stringUtils.getChunkFilePath(chunkName as string);

        await stringUtils.processChunkStream(filePath, permutationsArr);
      })
    );
  },

  /**
   * Finds the best match for a substring within a given string based on cost.
   * This function identifies the optimal substring match by minimizing the total cost,
   * where cost is determined by the word frequency in the `words` dictionary.
   */
  bestMatch: (index, string, costs) => {
    const bestMatch = costs
      .slice(Math.max(0, index - stringUtils.maxWordLength), index)
      .reverse()
      .reduce(
        (acc, prevCost, length) => {
          const substring = string.slice(index - length - 1, index);
          const matchCost =
            prevCost + (stringUtils.words[substring] || stringUtils.maxCost);
          const candidate = { matchCost, matchLength: length + 1 };
          const bestMatch = matchCost < acc.matchCost ? candidate : acc;

          return bestMatch;
        },
        { matchCost: stringUtils.maxCost, matchLength: 0 }
      );

    return bestMatch;
  },

  /**
   * Computes an array of costs for splitting a string into substrings.
   * The cost at each position represents the minimum cost of splitting the string
   * up to that position, considering all possible substrings.
   */
  getCosts: (string) =>
    Array.from(string).reduce(
      (acc, _, i) => {
        const { matchCost } = stringUtils.bestMatch(i + 1, string, acc);
        acc.push(matchCost);

        return acc;
      },
      [0]
    ),

  /**
   * Recursively splits a string into substrings based on costs, storing the results in an accumulator.
   * This function is used internally to perform the actual splitting of the string by evaluating
   * the cost of each potential split and choosing the most optimal one.
   */
  recursiveSplit: (x, string, costs, acc) => {
    if (x <= 0) {
      const result = acc.reverse();

      return result;
    }

    const { matchCost, matchLength } = stringUtils.bestMatch(x, string, costs);

    if (matchCost !== costs[x]) {
      throw new Error('Cost Mismatch');
    }

    const newLength = x - matchLength;

    acc.push(string.slice(newLength, x));

    const next = stringUtils.recursiveSplit(newLength, string, costs, acc);

    return next;
  },

  /**
   * Splits a string into its component words based on computed costs.
   * This function leverages the `getCosts` and `recursiveSplit` methods to
   * break down a concatenated string into its most likely word components,
   * prioritizing splits that minimize the total word cost.
   */
  splitString: async (string, characterMapping = false) => {
    const sanitizedString = sanitization.sanitize(string, characterMapping);

    await stringUtils.fetchAndProcessChunks(sanitizedString);

    const costs = stringUtils.getCosts(sanitizedString);

    const result = stringUtils.recursiveSplit(
      sanitizedString.length,
      sanitizedString,
      costs,
      []
    );

    return result;
  },
};

export default stringUtils;
