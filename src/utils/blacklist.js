const path = require('path');

const { sanitize } = require('./sanitization');
const { writeJsonFile } = require('../helpers/helpers');

const blacklistJsonPath = '../data/blacklist.json';

const blacklist = require(blacklistJsonPath);

const blacklistUtils = {
  blacklistPath: path.join(__dirname, blacklistJsonPath),

  /**
   * Sanitizes the given term(s) and adds the sanitized versions to a Set.
   * This ensures that each sanitized term is unique within the blacklist.
   *
   * @param {string|string[]} terms - The term(s) to be sanitized. Can be a single string or an array of strings.
   * @returns {Set<string>} - A Set containing the sanitized terms, ensuring uniqueness.
   */
  addSanitized: (terms) => {
    const sanitizedAdditions = new Set();

    const termsArr = Array.isArray(terms) ? terms : [terms];

    termsArr.forEach((term) => {
      const sanitizedTerm = sanitize(term, true);
      sanitizedAdditions.add(sanitizedTerm);
    });

    return sanitizedAdditions;
  },

  /**
   * Asynchronously updates the blacklist by adding new sanitized terms to it.
   * The function accepts either an array of terms or a single string term,
   * sanitizes the term(s), and adds them to the blacklist. The updated blacklist is then saved to a JSON file.
   *
   * The path to the blacklist JSON file is specified by `blacklistJsonPath`.
   *
   * @param {string|string[]} update - The term(s) to add to the blacklist. Can be a single string or an array of strings.
   * @returns {Promise<string[]>} - A Promise that resolves with an array of the added sanitized terms.
   */
  addBlacklist: async (update) => {
    const sanitizedAdditions = blacklistUtils.addSanitized(update);

    const newBlacklist = Array.from(
      new Set([...blacklist, ...sanitizedAdditions])
    );

    await writeJsonFile(blacklistUtils.blacklistPath, newBlacklist);

    const sanitizedArr = Array.from(sanitizedAdditions);

    return sanitizedArr;
  },

  /**
   * Asynchronously removes the specified term(s) from the blacklist.
   * The function accepts either an array of terms or a single string term,
   * removes the specified term(s) from the blacklist, and updates the blacklist JSON file.
   *
   * @param {string|string[]} update - The term(s) to remove from the blacklist. Can be a single string or an array of strings.
   * @returns {Promise<string[]>} - A Promise that resolves with an array of the removed terms.
   */
  removeBlacklist: async (update) => {
    const removed = [];

    const removeArr = Array.isArray(update) ? update : [update];

    const newBlacklist = blacklist.filter((term) => {
      if (!removeArr.includes(term)) {
        return true;
      } else {
        removed.push(term);
        return false;
      }
    });

    await writeJsonFile(blacklistUtils.blacklistPath, newBlacklist);

    return removed;
  },

  /**
   * Retrieves the current blacklist.
   *
   * @returns {string[]} - The current blacklist as an array of strings.
   */
  getBlacklist: () => blacklist,
};

module.exports = blacklistUtils;
