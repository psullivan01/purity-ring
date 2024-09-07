import { jest } from '@jest/globals';
import blacklistUtils from '../../utils/blacklist';
import helpers from '../../helpers/helpers';
import sanitization from '../../utils/sanitization';

jest.mock('../../helpers/helpers.js', () => ({
  writeJsonFile: jest.fn(),
  getDirname: jest.fn().mockReturnValue('test'),
  getJsonFile: jest
    .fn<() => Promise<Record<string, string[]>>>()
    .mockResolvedValue({
      common: ['badwordc', 'badwordd'],
      special: [],
    }),
}));

const { writeJsonFile, getJsonFile } = helpers;

describe('blacklistUtils', () => {
  const blacklistArr = ['badwordc', 'badwordd'];

  const mockSanitize = jest.spyOn(sanitization, 'sanitize').mockReturnValue('');

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockSanitize.mockReset();
  });

  describe('addSanitized', () => {
    it('should sanitize and add a single term to the set', () => {
      const term = 'badword';
      mockSanitize.mockReturnValue(term);

      const result = blacklistUtils.addSanitized(term);

      expect(mockSanitize).toHaveBeenCalledWith(term, true);
      expect(result).toEqual(new Set([term]));
    });

    it('should sanitize and add multiple terms to the set', () => {
      const terms = ['badworda', 'badwordb'];
      terms.forEach((term) => mockSanitize.mockReturnValueOnce(term));

      const result = blacklistUtils.addSanitized(terms);

      terms.forEach((term) => {
        expect(mockSanitize).toHaveBeenCalledWith(term, true);
      });

      expect(result).toEqual(new Set(terms));
    });
  });

  describe('addBlacklist', () => {
    it('should sanitize and add a single term to the blacklist', async () => {
      jest.spyOn(helpers, 'writeJsonFile').mockResolvedValue(undefined);
      const term = 'badword';
      mockSanitize.mockReturnValue(term);

      const added = await blacklistUtils.addBlacklist({ common: [term] });

      expect(mockSanitize).toHaveBeenCalledWith(term, true);
      expect(added).toEqual([term]);
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.stringContaining('/data/blacklist.json'),
        expect.objectContaining({
          common: expect.arrayContaining([...blacklistArr, term]),
        })
      );
    });

    it('should sanitize and add multiple terms to the blacklist', async () => {
      const terms = ['badworda', 'badwordb'];
      terms.forEach((term) => mockSanitize.mockReturnValueOnce(term));

      const added = await blacklistUtils.addBlacklist({ common: terms });

      terms.forEach((term) => {
        expect(mockSanitize).toHaveBeenCalledWith(term, true);
      });

      expect(added).toEqual(terms);
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.stringContaining('/data/blacklist.json'),
        expect.objectContaining({
          common: expect.arrayContaining([...blacklistArr, ...terms]),
        })
      );
    });
  });

  describe('getBlacklist', () => {
    it('should return the current blacklist', async () => {
      const blacklist = await blacklistUtils.getBlacklist();
      expect(getJsonFile).toHaveBeenCalledWith(
        expect.stringContaining('/data/blacklist.json')
      );
      expect(blacklist).toEqual({
        common: ['badwordc', 'badwordd', 'badword', 'badworda', 'badwordb'],
        special: [],
      });
    });
  });

  describe('removeBlacklist', () => {
    it('should remove specified terms from the blacklist', async () => {
      const removedTerms = await blacklistUtils.removeBlacklist('badwordc');

      expect(removedTerms).toEqual(['badwordc']);
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.stringContaining('/data/blacklist.json'),
        expect.objectContaining({
          common: ['badwordd', 'badword', 'badworda', 'badwordb'],
          special: [],
        })
      );
    });

    it('should return an empty array if no matching terms are found', async () => {
      const removedTerms =
        await blacklistUtils.removeBlacklist('notInBlacklist');

      expect(removedTerms).toEqual([]);
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.stringContaining('/data/blacklist.json'),
        expect.objectContaining({
          common: ['badwordc', 'badwordd', 'badword', 'badworda', 'badwordb'],
          special: [],
        })
      );
    });

    it('should remove multiple terms from the blacklist', async () => {
      const removedTerms = await blacklistUtils.removeBlacklist(blacklistArr);

      expect(removedTerms).toEqual(blacklistArr);
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.stringContaining('/data/blacklist.json'),
        expect.objectContaining({
          common: ['badword', 'badworda', 'badwordb'],
          special: [],
        })
      );
    });
  });
});
