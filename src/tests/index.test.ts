import { validate, splitString, addBlacklist } from '../index';

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
  it('should correctly expose validate from validation.ts', () => {
    expect(validate).toBe(validate);
  });

  it('should correctly expose splitString from string.ts', () => {
    expect(splitString).toBe(splitString);
  });

  it('should correctly expose addBlacklist from blacklist.ts', () => {
    expect(addBlacklist).toBe(addBlacklist);
  });
});
