const path = require('path');
const blacklistUtils = require('../../utils/blacklist');
const { sanitize } = require('../../utils/sanitization');
const { writeJsonFile } = require('../../helpers/helpers');

jest.mock('../../utils/sanitization');
jest.mock('../../helpers/helpers');

const blacklistArr = ['badwordc', 'badwordd'];

jest.mock('../../data/blacklist.json', () => blacklistArr);

describe('blacklistUtils', () => {
  let blacklist;

  beforeEach(() => {
    blacklist = [];
    jest.clearAllMocks();
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
    it('should return the current blacklist', () => {
      const blacklist = blacklistUtils.getBlacklist();
      expect(blacklist).toEqual(blacklistArr);
    });
  });

  describe('removeBlacklist', () => {
    it('should remove specified terms from the blacklist', async () => {
      const removedTerms = await blacklistUtils.removeBlacklist('badwordc');

      expect(removedTerms).toEqual(['badwordc']);
      expect(writeJsonFile).toHaveBeenCalledWith(
        path.join(__dirname, '../../data/blacklist.json'),
        ['badwordd']
      );
    });

    it('should return an empty array if no matching terms are found', async () => {
      const removedTerms =
        await blacklistUtils.removeBlacklist('notInBlacklist');

      expect(removedTerms).toEqual([]);
      expect(writeJsonFile).toHaveBeenCalledWith(
        path.join(__dirname, '../../data/blacklist.json'),
        blacklistArr
      );
    });

    it('should remove multiple terms from the blacklist', async () => {
      const removedTerms = await blacklistUtils.removeBlacklist(blacklistArr);

      expect(removedTerms).toEqual(['badwordc', 'badwordd']);
      expect(writeJsonFile).toHaveBeenCalledWith(
        path.join(__dirname, '../../data/blacklist.json'),
        []
      );
    });
  });
});
