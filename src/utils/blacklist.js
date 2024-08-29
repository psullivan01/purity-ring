import { promises as fs } from 'fs';
import path from 'path';
import sanitization from './sanitization.js';
import helpers from '../helpers/helpers.js';

const { sanitize } = sanitization;
const { writeJsonFile } = helpers;

const blacklistUtils = {
  blacklistPath: 'src/data/blacklist.json',

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
   * @async
   * @function
   * @param {string|string[]} update - The term(s) to add to the blacklist. Can be a single string or an array of strings.
   * @returns {Promise<string[]>} - A Promise that resolves with an array of the added sanitized terms.
   */
  addBlacklist: async (update) => {
    const blacklist = await blacklistUtils.getBlacklist();

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
   * @async
   * @function
   * @param {string|string[]} update - The term(s) to remove from the blacklist. Can be a single string or an array of strings.
   * @returns {Promise<string[]>} - A Promise that resolves with an array of the removed terms.
   */
  removeBlacklist: async (update) => {
    const blacklist = await blacklistUtils.getBlacklist();

    const removed = [];

    const removeArr = Array.isArray(update) ? update : [update];

    const newBlacklist = blacklist.filter((term) =>
      !removeArr.includes(term) ? true : (removed.push(term), false)
    );

    await writeJsonFile(blacklistUtils.blacklistPath, newBlacklist);

    return removed;
  },

  /**
   * Asynchronously retrieves the current blacklist.
   *
   * @async
   * @function
   * @returns {Promise<string[]>} - A promise that resolves to the current blacklist as an array of strings.
   * @throws {Error} - Throws an error if the blacklist file cannot be read or parsed.
   */
  getBlacklist: async () => {
    try {
      const data = JSON.parse(
        await fs.readFile(path.resolve(blacklistUtils.blacklistPath), 'utf8')
      );
      return data;
    } catch (err) {
      console.error('Error reading the blacklist file', err);
      throw err;
    }
  },
};

export default blacklistUtils;
