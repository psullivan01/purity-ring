const { validate } = require('./utils/validation');
const { splitString } = require('./utils/string');
const {
  addBlacklist,
  removeBlacklist,
  getBlacklist,
} = require('./utils/blacklist');

const purityRing = {
  validate,
  splitString,
  addBlacklist,
  removeBlacklist,
  getBlacklist,
};

module.exports = purityRing;
