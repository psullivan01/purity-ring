const validation = require('../../utils/validation');
const { splitString } = require('../../utils/string');

jest.mock('../../utils/string');
jest.mock('../../data/blacklist.json', () => ['test']);

describe('validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const options = { verbose: true };

    it('should return isBlacklisted as true when a blacklisted word is found', () => {
      const input = 'This is a test';
      const sanitized = 'this is a test';
      const splitStringArr = ['this', 'is', 'a', 'test'];

      splitString.mockReturnValue(splitStringArr);

      const result = validation.validate(input, options);

      expect(splitString).toHaveBeenCalledWith(input, true);
      expect(result.isBlacklisted).toBe(true);
      expect(result).toHaveProperty('blacklistMatch', 'test');
    });

    it('should return isBlacklisted as false when no blacklisted word is found', () => {
      const input = 'This is clean';
      const sanitized = 'this is clean';
      const splitStringArr = ['this', 'is', 'clean'];

      splitString.mockReturnValue(splitStringArr);

      const result = validation.validate(input, options);

      expect(splitString).toHaveBeenCalledWith(input, true);
      expect(result.isBlacklisted).toBe(false);
      expect(result).toHaveProperty('blacklistMatch', undefined);
    });

    it('should return basic result without options argument', () => {
      const input = 'This is a test';
      const sanitized = 'this is a test';
      const splitStringArr = ['this', 'is', 'a', 'test'];

      splitString.mockReturnValue(splitStringArr);

      const result = validation.validate(input);

      expect(splitString).toHaveBeenCalledWith(input, true);
      expect(result.isBlacklisted).toBe(true);
    });

    it('should return an empty result when input string is empty', () => {
      const input = '';
      const sanitized = '';
      const splitStringArr = [''];

      splitString.mockReturnValue(splitStringArr);

      const result = validation.validate(input, options);

      expect(splitString).toHaveBeenCalledWith(input, true);
      expect(result.isBlacklisted).toBe(false);
      expect(result).toHaveProperty('blacklistMatch', undefined);
      expect(result).toHaveProperty('originalString', input);
      expect(result).toHaveProperty('substitutedString', '');
    });
  });
});
