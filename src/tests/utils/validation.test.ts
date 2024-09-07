import validation from '../../utils/validation';
import stringUtils from '../../utils/string';
import sanitization from '../../utils/sanitization';

const { splitString } = stringUtils;

jest.mock('../../utils/string', () => ({
  splitString: jest.fn(),
}));

jest.mock('../../utils/blacklist', () => ({
  getBlacklist: jest.fn().mockReturnValue({
    common: ['test'],
    commonVariant: ['testing'],
    special: ['foo'],
  }),
}));

describe('validation', () => {
  const mockSanitize = jest.spyOn(sanitization, 'sanitize').mockReturnValue('');

  beforeEach(() => {
    jest.clearAllMocks();
    mockSanitize.mockReset();
  });

  describe('validate', () => {
    const options = { verbose: true };

    it('should return isBlacklisted as true when a blacklisted word is found', async () => {
      const input = 'This is a test';
      const splitStringArr = ['this', 'is', 'a', 'test'];

      (splitString as jest.Mock).mockReturnValue(splitStringArr);

      const result = await validation.validate(input, options);

      expect(splitString).toHaveBeenCalledWith(input, true);
      expect(result.isBlacklisted).toBe(true);
      expect(result).toHaveProperty('blacklistMatch', 'test');
    });

    it('should return isBlacklisted as false when no blacklisted word is found', async () => {
      const input = 'This is cl3an';
      const substituted = 'this is clean';
      const splitStringArr = ['this', 'is', 'clean'];

      (splitString as jest.Mock).mockReturnValue(splitStringArr);

      const result = await validation.validate(input, options);

      expect(splitString).toHaveBeenCalledWith(input, true);
      expect(result.isBlacklisted).toBe(false);
      expect(result).toHaveProperty('blacklistMatch', undefined);
      expect(result).toHaveProperty('originalString', input);
      expect(result).toHaveProperty('substitutedString', substituted);
    });

    it('should return isBlacklisted as true when input string contains commonVariant', async () => {
      const input = 'this is testing';

      const result = await validation.validate(input, {
        verbose: false,
        characterMapping: false,
      });

      expect(result).toEqual({ isBlacklisted: true });
    });

    it('should return basic result without options argument', async () => {
      const input = 'This is a test';
      const splitStringArr = ['this', 'is', 'a', 'test'];

      (splitString as jest.Mock).mockReturnValue(splitStringArr);

      const result = await validation.validate(input);

      expect(splitString).toHaveBeenCalledWith(input, true);
      expect(result.isBlacklisted).toBe(true);
    });

    it('should return an empty result when input string is empty', async () => {
      const input = '';
      const splitStringArr = [''];

      (splitString as jest.Mock).mockReturnValue(splitStringArr);

      const result = await validation.validate(input, options);

      expect(splitString).toHaveBeenCalledWith(input, true);
      expect(result.isBlacklisted).toBe(false);
      expect(result).toHaveProperty('blacklistMatch', undefined);
      expect(result).toHaveProperty('originalString', input);
      expect(result).toHaveProperty('substitutedString', '');
    });
  });

  describe('evaluateBlacklist', () => {
    it('should categorize a term as common', async () => {
      jest.spyOn(validation, 'validate').mockResolvedValueOnce({
        isBlacklisted: false,
        originalString: 'badword',
        substitutedString: 'badword',
      });
      mockSanitize.mockReturnValue('badword');

      const evalResult = await validation.evaluateBlacklist(['badword']);

      expect(evalResult).toEqual({
        common: ['badword'],
      });
    });

    it('should handle missing originalString and substitutedString', async () => {
      jest.spyOn(validation, 'validate').mockResolvedValueOnce({
        isBlacklisted: false,
        originalString: undefined,
        substitutedString: undefined,
      });
      mockSanitize.mockReturnValue('badword');

      const evalResult = await validation.evaluateBlacklist(['badword']);

      expect(evalResult).toEqual({
        common: ['badword'],
      });
    });

    it('should categorize a term as commonVariant if split and blacklisted', async () => {
      jest.spyOn(validation, 'validate').mockResolvedValueOnce({
        isBlacklisted: true,
        originalString: 'badwordbad',
        substitutedString: 'bad wordbad',
      });
      mockSanitize.mockReturnValue('badwordbad');

      const evalResult = await validation.evaluateBlacklist(['badwordbad']);

      expect(evalResult).toEqual({
        commonVariant: ['badwordbad'],
      });
    });

    it('should categorize a term as special if split and not blacklisted', async () => {
      jest.spyOn(validation, 'validate').mockResolvedValueOnce({
        isBlacklisted: false,
        originalString: 'goodwordbad',
        substitutedString: 'good wordbad',
      });
      mockSanitize.mockReturnValue('goodwordbad');

      const evalResult = await validation.evaluateBlacklist(['goodwordbad']);

      expect(evalResult).toEqual({
        special: ['goodwordbad'],
      });
    });

    it('should categorize a term as duplicate if blacklisted and not split', async () => {
      jest.spyOn(validation, 'validate').mockResolvedValueOnce({
        isBlacklisted: true,
        originalString: 'badword',
        substitutedString: 'badword',
      });
      mockSanitize.mockReturnValue('badword');

      const evalResult = await validation.evaluateBlacklist(['badword']);

      expect(evalResult).toEqual({
        duplicate: ['badword'],
      });
    });
  });
});
