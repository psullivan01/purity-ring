import validation from '../utils/validation.js';
import stringUtils from '../utils/string.js';
import blacklistUtils from '../utils/blacklist.js';
import purityRing from '../index.js';

const { validate } = validation;
const { splitString } = stringUtils;
const { addBlacklist } = blacklistUtils;

jest.mock('../utils/validation', () => ({
  validate: jest.fn(),
}));

jest.mock('../utils/string', () => ({
  splitString: jest.fn(),
}));

jest.mock('../utils/blacklist', () => ({
  addBlacklist: jest.fn(),
}));

describe('purityRing', () => {
  it('should correctly expose validate from validation.js', () => {
    expect(purityRing.validate).toBe(validate);
  });

  it('should correctly expose splitString from string.js', () => {
    expect(purityRing.splitString).toBe(splitString);
  });

  it('should correctly expose addBlacklist from blacklist.js', () => {
    expect(purityRing.addBlacklist).toBe(addBlacklist);
  });
});
