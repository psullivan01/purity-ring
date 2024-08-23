const sanitization = require('../../utils/sanitization');

jest.mock('../../data/leet.json', () => ({
  e: '3',
  s: '5|\\$',
}));

describe('sanitization', () => {
  const variantLimit = 1;

  process.env.VARIANT_LIMIT = variantLimit;

  let accumulator;

  beforeEach(() => {
    accumulator = new Set();
  });

  describe('processString', () => {
    it('should replace leet characters', () => {
      const inputStr = 't3st';

      const result = sanitization.processString(inputStr);

      expect(result).toBe('test');
    });

    it('should handle strings with no leet characters by adding the original string', () => {
      const inputStr = 'test';

      const result = sanitization.processString(inputStr);

      expect(result).toBe(inputStr);
    });
  });

  describe('sanitize', () => {
    it('should return sanitized variations of a string with character mapping', () => {
      const inputStr = 't3st';
      const expectedOutput = 'test';

      const result = sanitization.sanitize(inputStr, true);

      expect(result).toEqual(expectedOutput);
    });

    it('should handle strings with multiple leet characters with character mapping', () => {
      const inputStr = 't3$t5';
      const expectedOutput = 'tests';

      const result = sanitization.sanitize(inputStr, true);

      expect(result).toEqual(expectedOutput);
    });

    it('should return the original string if there are no leet characters with character mapping', () => {
      const inputStr = 'test';
      const expectedOutput = 'test';

      const result = sanitization.sanitize(inputStr, true);

      expect(result).toEqual(expectedOutput);
    });

    it('should return the original string if there are no leet characters without character mapping', () => {
      const inputStr = 'test';
      const expectedOutput = 'test';

      const result = sanitization.sanitize(inputStr, false);

      expect(result).toEqual(expectedOutput);
    });

    it('should return the lowercase string without numbers if characterMapping is false', () => {
      const inputStr = 'test123';
      const expectedOutput = 'test';

      const result = sanitization.sanitize(inputStr, false);

      expect(result).toEqual(expectedOutput);
    });
  });
});
