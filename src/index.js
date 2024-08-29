import validation from './utils/validation.js';
import stringUtils from './utils/string.js';
import blacklistUtils from './utils/blacklist.js';

const { validate } = validation;
const { splitString } = stringUtils;
const { addBlacklist, removeBlacklist, getBlacklist } = blacklistUtils;

const purityRing = {
  validate,
  splitString,
  addBlacklist,
  removeBlacklist,
  getBlacklist,
};

export default purityRing;
