import path from 'path';
import sanitization from './sanitization.js';
import helpers from '../helpers/helpers.js';
import type { BlacklistUtils } from './utils.types.d';

const blacklistUtils: BlacklistUtils = {
  blacklistPath: () => {
    const dirname = helpers.getDirname();
    const blacklistPath = path.resolve(dirname, '../data/blacklist.json');

    return blacklistPath;
  },

  /**
   * Sanitizes the given term(s) and adds the sanitized versions to a Set.
   * This ensures that each sanitized term is unique within the blacklist.
   */
  addSanitized: (terms) => {
    const sanitizedAdditions = new Set<string>();
    const termsArr = Array.isArray(terms) ? terms : [terms];

    termsArr.forEach((term) => {
      const sanitizedTerm = sanitization.sanitize(term, true);
      sanitizedAdditions.add(sanitizedTerm);
    });

    return sanitizedAdditions;
  },

  /**
   * Asynchronously updates the blacklist by adding new sanitized terms to it.
   * Accepts an object of terms categorized into common, commonVariant, and special.
   * Sanitized terms are added to the respective category in the blacklist, and the updated
   * blacklist is saved to a JSON file.
   */
  addBlacklist: async (update) => {
    const blacklist = await blacklistUtils.getBlacklist();
    const sanitizedAdditions: string[] = [];

    Object.entries(update).forEach(([blacklistType, wordArr]) => {
      const sanitizedAdditionsArr = Array.from(
        blacklistUtils.addSanitized(wordArr)
      );
      const blacklistData = blacklist[blacklistType];

      blacklist[blacklistType] = Array.from(
        new Set([...blacklistData, ...sanitizedAdditionsArr])
      );

      sanitizedAdditions.push(...sanitizedAdditionsArr);
    });

    const path = blacklistUtils.blacklistPath();

    await helpers.writeJsonFile(path, blacklist);

    return sanitizedAdditions;
  },

  /**
   * Asynchronously removes the specified term(s) from the blacklist.
   * Accepts either an array of terms or a single string term,
   * removes the specified term(s) from the blacklist, and updates the blacklist JSON file.
   */
  removeBlacklist: async (update) => {
    const removed: string[] = [];
    const blacklist = await blacklistUtils.getBlacklist();
    const removeArr = Array.isArray(update) ? update : [update];

    const newBlacklist = Object.entries(blacklist).reduce(
      (acc: Record<string, string[]>, [blacklistType, wordArr]) => {
        acc[blacklistType] = wordArr.filter((term) =>
          !removeArr.includes(term) ? true : (removed.push(term), false)
        );

        return acc;
      },
      {} as Record<string, string[]>
    );

    const path = blacklistUtils.blacklistPath();

    await helpers.writeJsonFile(path, newBlacklist);

    return removed;
  },

  /**
   * Asynchronously retrieve the current blacklist.
   */
  getBlacklist: async () => {
    const path = blacklistUtils.blacklistPath();
    return (await helpers.getJsonFile(path)) as Record<string, string[]>;
  },
};

export default blacklistUtils;
