import path from 'path';
import blacklistUtils from '../../utils/blacklist.js';
import helpers from '../../helpers/helpers.js';
import sanitization from '../../utils/sanitization.js';
import { promises as mockPromises } from 'fs';

const { sanitize } = sanitization;
const { writeJsonFile } = helpers;

jest.mock('../../utils/sanitization', () => ({
  sanitize: jest.fn(),
}));
jest.mock('../../helpers/helpers', () => ({
  writeJsonFile: jest.fn(),
}));

// Mock fs.promises.readFile and writeFile
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

jest.mock('path', () => ({
  resolve: jest.fn(() => 'src/data/blacklist.json'),
  join: jest.requireActual('path').join,
}));

const blacklistArr = ['badwordc', 'badwordd'];
const stringifiedArr = JSON.stringify(blacklistArr);

describe('blacklistUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPromises.readFile.mockReturnValue(stringifiedArr);
  });

  describe('addBlacklist', () => {
    it('should sanitize and add a single term to the blacklist', async () => {
      const term = 'badword';
      sanitize.mockReturnValue(term);

      const added = await blacklistUtils.addBlacklist(term);

      expect(sanitize).toHaveBeenCalledWith(term, true);
      expect(added).toEqual([term]);
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([...blacklistArr, term])
      );
    });

    it('should sanitize and add multiple terms to the blacklist', async () => {
      const terms = ['badworda', 'badwordb'];

      terms.forEach((term) => sanitize.mockReturnValueOnce(term));

      const added = await blacklistUtils.addBlacklist(terms);

      terms.forEach((term) => {
        expect(sanitize).toHaveBeenCalledWith(term, true);
      });

      expect(added).toEqual(terms);
      expect(writeJsonFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([...blacklistArr, ...terms])
      );
    });
  });

  describe('getBlacklist', () => {
    it('should return the current blacklist', async () => {
      const blacklist = await blacklistUtils.getBlacklist();
      expect(blacklist).toEqual(blacklistArr);
    });

    it('should throw an error if the file cannot be read', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      require('fs').promises.readFile.mockRejectedValue(
        new Error('File not found')
      );

      await expect(blacklistUtils.getBlacklist()).rejects.toThrow(
        'File not found'
      );

      console.error.mockRestore();
    });
  });

  describe('removeBlacklist', () => {
    it('should remove specified terms from the blacklist', async () => {
      const removedTerms = await blacklistUtils.removeBlacklist('badwordc');

      expect(removedTerms).toEqual(['badwordc']);
      expect(writeJsonFile).toHaveBeenCalledWith(
        path.resolve(blacklistUtils.blacklistPath),
        ['badwordd']
      );
    });

    it('should return an empty array if no matching terms are found', async () => {
      const removedTerms =
        await blacklistUtils.removeBlacklist('notInBlacklist');

      expect(removedTerms).toEqual([]);
      expect(writeJsonFile).toHaveBeenCalledWith(
        path.resolve(blacklistUtils.blacklistPath),
        blacklistArr
      );
    });

    it('should remove multiple terms from the blacklist', async () => {
      const removedTerms = await blacklistUtils.removeBlacklist(blacklistArr);

      expect(removedTerms).toEqual(['badwordc', 'badwordd']);
      expect(writeJsonFile).toHaveBeenCalledWith(
        path.resolve(blacklistUtils.blacklistPath),
        []
      );
    });
  });
});
