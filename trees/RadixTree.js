class RadixNode {
  constructor(key = '', value = null) {
    this.key = key;
    this.value = value;
    this.children = {};
  }
}

class RadixTree {
  constructor() {
    this.root = new RadixNode();
  }

  insert(key, value) {
    let node = this.root;
    let currentKey = key;

    while (currentKey.length > 0) {
      let foundChild = false;
      const { children } = node;

      for (const childKey in children) {
        if (currentKey.startsWith(childKey)) {
          node = children[childKey];
          currentKey = currentKey.slice(childKey.length);
          foundChild = true;
          break;
        }

        const commonPrefix = this._commonPrefix(currentKey, childKey);
        if (commonPrefix.length > 0) {
          const existingChild = children[childKey];
          const newChild = new RadixNode(
            childKey.slice(commonPrefix.length),
            existingChild.value
          );
          newChild.children = existingChild.children;

          children[commonPrefix] = new RadixNode(commonPrefix);
          children[commonPrefix].children[newChild.key] = newChild;
          delete children[childKey];

          if (commonPrefix === currentKey) {
            children[commonPrefix].value = value;
            return;
          }

          node = children[commonPrefix];
          currentKey = currentKey.slice(commonPrefix.length);
          children[currentKey] = new RadixNode(currentKey, value);
          return;
        }
      }

      if (!foundChild) {
        children[currentKey] = new RadixNode(currentKey, value);
        return;
      }
    }

    node.value = value;
  }

  search(key) {
    let node = this.root;
    let currentKey = key;

    while (currentKey.length > 0) {
      let foundChild = false;

      for (const childKey in node.children) {
        if (currentKey.startsWith(childKey)) {
          node = node.children[childKey];
          currentKey = currentKey.slice(childKey.length);
          foundChild = true;
          break;
        }
      }

      if (!foundChild) {
        return null;
      }
    }

    return node.value;
  }

  _commonPrefix(str1, str2) {
    let index = 0;
    while (
      index < str1.length &&
      index < str2.length &&
      str1[index] === str2[index]
    ) {
      index++;
    }
    return str1.slice(0, index);
  }

  searchInDeserializedTree(root, key) {
    let node = root;
    let currentKey = key;

    while (currentKey.length > 0) {
      let foundChild = false;

      for (const childKey in node.children) {
        if (currentKey.startsWith(childKey)) {
          node = node.children[childKey];
          currentKey = currentKey.slice(childKey.length);
          foundChild = true;
          break;
        }
      }

      if (!foundChild) {
        return null;
      }
    }

    return node.value;
  }
}

module.exports = RadixTree;
