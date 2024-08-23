const { validate } = require('../utils/validation');
const { splitString } = require('../utils/string');
const { addBlacklist } = require('../utils/blacklist');
const purityRing = require('../index');

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
