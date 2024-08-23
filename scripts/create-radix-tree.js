const fs = require('fs');

const words = require('../src/en-frequency.json');
const RadixTree = require('../trees/RadixTree.js');

// function to create RadixTree of words and their word cost
getRadixTree = () => {
  const radixTree = new RadixTree();

  words.forEach((word, i) => {
    const wordCost = Math.log((i + 1) * Math.log(word.length));

    radixTree.insert(word, wordCost);
  });

  return radixTree;
};

persistRadixTree = () => {
  const radixTree = getRadixTree();

  const json = JSON.stringify(radixTree, null, 2);

  const outputPath = './src/radix-tree.json';

  fs.writeFile(outputPath, json, (err) => {
    if (err) {
      console.error('Error writing the JSON file:', err);
      return;
    }
    console.log(`File successfully written to ${outputPath}`);
  });

  return;
};

persistRadixTree();
