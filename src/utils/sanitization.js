const leet = require('../data/leet.json');

const sanitization = {
  /**
   * Removes special characters from a string, leaving only alphabetic characters,
   * apostrophes, and spaces.
   *
   * @param {string} string - The input string to be processed.
   * @returns {string} - The sanitized string with special characters removed.
   */
  removeSpecialCharacters: (string) =>
    string.replace(new RegExp("[^a-zA-Z' ]", 'g'), ''),

  /**
   * Processes a string to replace leet characters with their alphabetic equivalents.
   * The function iterates over the `leet` dictionary and replaces occurrences of leet
   * characters in the input string. Special characters are then removed from the resulting string.
   *
   * @param {string} inputStr - The string to be processed.
   * @returns {string} - The processed string with leet characters replaced and special characters removed.
   */
  processString: (inputStr) => {
    const replacedStr = Object.entries(leet).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(value, 'g'), key),
      inputStr
    );

    const sanitizedStr = sanitization.removeSpecialCharacters(replacedStr);

    return sanitizedStr;
  },

  /**
   * Sanitizes a string by converting it to lowercase and optionally replacing leet characters
   * with their alphabetic equivalents. The function returns a single sanitized string.
   *
   * If `characterMapping` is set to `false`, the function will only remove special characters
   * from the string and will not perform leet character replacement.
   *
   * @param {string} string - The string to sanitize.
   * @param {boolean} [characterMapping] - Flag to indicate if character mapping should be applied.
   *                                       If `false`, only special characters are removed.
   * @returns {string} - The sanitized string.
   */
  sanitize: (string, characterMapping) => {
    const lowerCaseString = string.toLowerCase();

    const sanitized = characterMapping
      ? sanitization.processString(lowerCaseString)
      : sanitization.removeSpecialCharacters(lowerCaseString);

    return sanitized;
  },
};

module.exports = sanitization;
