class SuffixTreeNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class SuffixTree {
  constructor() {
    this.root = new SuffixTreeNode();
  }

  insert = (word) => {
    word.split('').forEach((letter) => this._insertSuffix(letter));
    const length = word.length;
    for (let i = 0; i < length; i++) {
      this._insertSuffix(word.slice(i));
    }
  };

  _insertSuffix = (suffix) => {
    let node = this.root;

    suffix.split('').forEach((char) => {
      if (!node.children[char]) {
        node.children[char] = new SuffixTreeNode();
      }

      node = node.children[char];
    });

    node.isEndOfWord = true;
  };

  hasSuffix = (suffix) => {
    let node = this.root;

    suffix.split('').forEach((char) => {
      const character = node.children[char];

      if (character) {
        return false;
      }

      node = character;
    });

    return true;
  };
}

module.exports = SuffixTree;
