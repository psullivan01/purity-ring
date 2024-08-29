import fs from 'fs';
import path from 'path';
import sanitization from './sanitization.js';

const { maxWordLength, words } = JSON.parse(
  fs.readFileSync(path.resolve('src/data/words.json'), 'utf8')
);

const stringUtils = {
  /**
   * The maximum cost value used as a fallback when a substring is not found in the words dictionary.
   * This ensures that unmatched substrings are penalized in cost-based calculations.
   *
   * @type {number}
   */
  maxCost: 9e999,

  /**
   * Finds the best match for a substring within a given string based on cost.
   * This function identifies the optimal substring match by minimizing the total cost,
   * where cost is determined by the word frequency in the `words` dictionary.
   *
   * @param {number} index - The current index in the string being processed.
   * @param {string} string - The full string being analyzed.
   * @param {number[]} costs - An array of cumulative costs associated with each position in the string.
   * @returns {Object} - An object containing the best match cost and the length of the matched substring.
   * @returns {number} returns.matchCost - The computed cost for the best substring match.
   * @returns {number} returns.matchLength - The length of the matched substring.
   */
  bestMatch: (index, string, costs) =>
    costs
      .slice(Math.max(0, index - maxWordLength), index)
      .reverse()
      .reduce(
        (acc, prevCost, length) => {
          const substring = string.slice(index - length - 1, index);
          const matchCost =
            prevCost + (words[substring] || stringUtils.maxCost);
          const candidate = { matchCost, matchLength: length + 1 };
          const bestMatch = matchCost < acc.matchCost ? candidate : acc;

          return bestMatch;
        },
        { matchCost: stringUtils.maxCost, matchLength: 0 }
      ),

  /**
   * Recursively splits a string into substrings based on costs, storing the results in an accumulator.
   * This function is used internally to perform the actual splitting of the string by evaluating
   * the cost of each potential split and choosing the most optimal one.
   *
   * @param {number} x - The current position in the string being split.
   * @param {string} string - The full string being split.
   * @param {number[]} costs - An array of costs associated with substrings.
   * @param {string[]} acc - An accumulator array to store the resulting substrings.
   * @returns {string[]} - The accumulator containing the split substrings in reverse order.
   * @throws {Error} - Throws an error if a cost mismatch is detected, indicating a logic error in cost computation.
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
   * Computes an array of costs for splitting a string into substrings.
   * The cost at each position represents the minimum cost of splitting the string
   * up to that position, considering all possible substrings.
   *
   * @param {string} string - The string for which costs will be calculated.
   * @returns {number[]} - An array of costs for each position in the string.
   */
  getCosts: (string) =>
    Array.from({ length: string.length }).reduce(
      (acc, _, i) => {
        const { matchCost } = stringUtils.bestMatch(i + 1, string, acc);

        acc.push(matchCost);

        return acc;
      },
      [0]
    ),

  /**
   * Splits a string into its component words based on computed costs.
   * This function leverages the `getCosts` and `recursiveSplit` methods to
   * break down a concatenated string into its most likely word components,
   * prioritizing splits that minimize the total word cost.
   *
   * @param {string} string - The string to be split into words.
   * @param {boolean} [characterMapping=false] - Optional flag to apply character mapping before splitting.
   * @returns {string[]} - An array of strings representing the split words.
   */
  splitString: (string, characterMapping = false) => {
    const sanitizedString = sanitization.sanitize(string, characterMapping);

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
