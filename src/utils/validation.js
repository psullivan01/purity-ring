import fs from 'fs';
import path from 'path';
import stringUtils from './string.js';

const { splitString } = stringUtils;

const blacklist = JSON.parse(
  fs.readFileSync(path.resolve('src/data/blacklist.json'), 'utf8')
);

const validation = {
  /**
   * Validates a given string by sanitizing it, splitting it into words, and checking if any of the words
   * match entries in the blacklist. Returns information about whether the string contains blacklisted words.
   * If the `verbose` option is enabled, additional information such as the matched word and the split result is returned.
   *
   * @param {string} string - The string to validate.
   * @param {Object} [options={}] - Optional settings for validation.
   * @param {boolean} [options.verbose=false] - If true, returns additional details about the validation process, including the matched word and the split string.
   * @param {boolean} [options.characterMapping=true] - If true, applies character mappings during sanitization. Set to false to skip this step.
   * @returns {{ isBlacklisted: boolean, blacklistMatch?: string, originalString?: string, substitutedString?: string }} -
   *   An object containing:
   *   - `isBlacklisted`: A boolean indicating whether a blacklisted word was found.
   *   - `blacklistMatch` (optional): The word from the string that matched the blacklist, if any (included only in verbose mode).
   *   - `originalString` (optional): The original string passed to the function (included only in verbose mode).
   *   - `substitutedString` (optional): The string after character mapping and splitting (included only in verbose mode).
   */
  validate: (string, options = {}) => {
    const { verbose = false, characterMapping = true } = options;

    let blacklistMatch;

    const blacklistSet = new Set(blacklist);

    const splitStringArr = splitString(string, characterMapping);

    const isBlacklisted = splitStringArr.some((word) => {
      if (blacklistSet.has(word)) {
        blacklistMatch = word;
        return true;
      }
      return false;
    });

    const result = {
      isBlacklisted,
      ...(verbose
        ? {
            blacklistMatch,
            originalString: string,
            substitutedString: splitStringArr.join(' '),
          }
        : {}),
    };

    return result;
  },
};

export default validation;
