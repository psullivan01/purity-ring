import type { Sanitization } from './utils.types.d.ts';

const sanitization: Sanitization = {
  /**
   * The leet object used for sanitation. Each charcter in the regex has a 1:1 relationship to
   * its key.
   */
  leet: {
    a: '4|\\/\\\\|@|\\/\\-\\\\',
    b: '8|13|!3|\\(3|\\/3|\\)3',
    c: '\\[|¢|\\(',
    d: '\\)|\\|\\)|\\[\\)|\\|\\}|\\|\\]',
    e: '3|£|€|\\[\\-|\\|=\\-',
    f: '\\|=|\\|#|\\/=',
    g: '6|\\(_\\+|9',
    h: '#|\\/\\-\\/|\\\\\\-\\\\|\\[\\-\\]|\\]\\-\\[|\\)\\-\\(|\\(\\-\\)|\\|~\\||\\|\\-\\||\\]~\\[|1\\-1',
    i: '1|\\||!',
    j: ',_\\||_\\||\\._\\||\\._\\]|_\\]|,_\\]|\\]',
    k: '\\|\\(|\\|<',
    l: '\\|_',
    n: '\\^\\/|\\|\\\\\\||\\/\\\\\\/|\\[\\\\\\]|\\{\\\\\\}|\\^',
    o: '0|\\(\\)|\\[\\]',
    p: '\\|\\*',
    q: '\\(_,\\)|\\(\\)_|0_',
    r: '\\|`|\\|~|\\|\\?|\\/2|\\|\\^',
    s: '5|\\$',
    t: '7|\\+|\\-\\|\\-',
    u: '\\(_\\)|\\|_\\|',
    v: '\\\\\\/|\\|\\/|\\\\\\|',
    w: "\\\\\\/\\\\\\/|'\\/\\/|\\\\\\\\'|\\\\\\^\\/|\\\\\\|\\/|\\\\_\\|_\\/|\\\\_:_\\/|\\\\\\\\\\/\\/\\\\\\\\\\/\\/",
    x: '\\}\\{|\\)\\(|\\]\\[',
    z: '2|7_',
  },

  /**
   * Removes special characters from a string, leaving only alphabetic characters,
   * apostrophes, and spaces.
   */
  removeSpecialCharacters: (input) =>
    input.replace(new RegExp('[^a-zA-Z]', 'g'), ''),

  /**
   * Processes a string to replace leet characters with their alphabetic equivalents.
   * The function iterates over the `leet` dictionary and replaces occurrences of leet
   * characters in the input string. Special characters are then removed from the resulting string.
   */
  processString: (inputStr) => {
    const replacedStr = Object.entries(sanitization.leet).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(value as string, 'g'), key),
      inputStr
    );

    const sanitizedStr = sanitization.removeSpecialCharacters(replacedStr);

    return sanitizedStr;
  },

  /**
   * Sanitizes a string by converting it to lowercase and optionally replacing leet characters
   * with their alphabetic equivalents. The function returns a single sanitized string.
   * If `characterMapping` is set to `false`, the function will only remove special characters
   * from the string and will not perform leet character replacement.
   */
  sanitize: (input, characterMapping) => {
    const lowerCaseString = input.toLowerCase();

    const sanitized = characterMapping
      ? sanitization.processString(lowerCaseString)
      : sanitization.removeSpecialCharacters(lowerCaseString);

    return sanitized;
  },
};

export default sanitization;
