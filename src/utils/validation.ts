import stringUtils from './string.js';
import blacklist from './blacklist.js';
import sanitization from './sanitization.js';
import type { Validation } from './utils.types.d';

const validation: Validation = {
  /**
   * Validates a given string by sanitizing it, splitting it into words, and checking if any of the words
   * match entries in the blacklist. Returns information about whether the string contains blacklisted words.
   * If the `verbose` option is enabled, additional information such as the matched word and the split result is returned.
   */
  validate: async (input: string, options = {}) => {
    const { verbose = false, characterMapping = true } = options;

    let isBlacklisted = false;
    let splitStringArr: string[] = [];

    const { common, commonVariant, special } =
      (await blacklist.getBlacklist()) as Record<string, string[]>;

    const blacklistSet = new Set<string>([...common, ...special]);

    let blacklistMatch: string | undefined;

    isBlacklisted = commonVariant.some((variant: string) =>
      input.includes(variant) ? ((blacklistMatch = variant), true) : false
    );

    if (!isBlacklisted) {
      splitStringArr = await stringUtils.splitString(input, characterMapping);

      isBlacklisted = splitStringArr.some((word: string) =>
        blacklistSet.has(word) ? ((blacklistMatch = word), true) : false
      );
    }

    const result = {
      isBlacklisted,
      ...(verbose
        ? {
            blacklistMatch,
            originalString: input,
            substitutedString: splitStringArr.join(' '),
          }
        : {}),
    };

    return result;
  },

  /**
   * Evaluates a list of terms and categorizes them into different blacklist types.
   * Each term is validated using an asynchronous validation function, then sanitized
   * and categorized based on whether it's blacklisted, has been split, or is a duplicate.
   * The function returns an object where the keys represent the blacklist categories, and
   * the values are arrays of sanitized terms belonging to each category.
   */
  evaluateBlacklist: async (evalArr) => {
    const promises = evalArr.map(async (term) => {
      const {
        isBlacklisted,
        originalString = '',
        substitutedString = '',
      } = await validation.validate(term, {
        verbose: true,
        characterMapping: true,
      });
      const isSplit = originalString.toLowerCase() !== substitutedString;
      const sanitizedTerm = sanitization.sanitize(term, true);

      let blacklistType: string;

      if (!isBlacklisted && !isSplit) {
        blacklistType = 'common';
      } else if (isBlacklisted && isSplit) {
        blacklistType = 'commonVariant';
      } else if (!isBlacklisted && isSplit) {
        blacklistType = 'special';
      } else {
        blacklistType = 'duplicate';
      }

      return { term: sanitizedTerm, blacklistType };
    });

    const results = await Promise.all(promises);

    const evalObj = results.reduce(
      (acc: Record<string, string[]>, { term, blacklistType }) => {
        if (!acc[blacklistType]) {
          acc[blacklistType] = [];
        }
        acc[blacklistType].push(term);
        return acc;
      },
      {}
    );

    return evalObj;
  },
};

export default validation;
