# Purity Ring

<img src="assets/the_one_ring.jpg" alt="The One Ring" width="200"/>

**Version**: 1.0.0  
**Description**: Sanitize usernames by splitting concatenated strings, substituting numbers/special characters for letters, and checking for blacklisted terms.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Future Enhancements](#future-enhancements)
6. [Contributing](#contributing)
7. [License](#license)
8. [Acknowledgements](#acknowledgements)
9. [Appendix](#appendix)

## Overview

Purity Ring was created to address the challenge of detecting profane or inappropriate usernames, which are often submitted as concatenated strings where numbers or special characters are used instead of letters. Traditional methods often result in a high rate of false positives -- such as mistakenly rejecting the word "passage" due to the presence of the blacklisted substring "ass".

To solve this, Purity Ring:

- Splits usernames into component words.
- Optionally substitutes numbers and special characters for their corresponding letters.
- Checks the resulting words against a blacklist.

## Features

### 1. String Splitting
Purity Ring uses word frequency data to split concatenated strings into their most likely component words.

### 2. Character Mapping

After splitting a string, Purity Ring allows users to optionally map special characters and numbers to their corresponding letters. In the interest of performance, special characters that could be mapped to multiple letters have been consolidated to their most likely use case. This enforces a **1:M** relationship for letters to characters, as opposed to a **M:M** relationship (more details [here](#a-character-mapping)).

### 3. Blacklist Management
Purity Ring provides a flexible blacklist management system. While there isn't a definitive list of blacklisted terms out there, Purity Ring allows users to aggregate terms from various publicly available lists and to add their own terms.

Due to the nature of Purity Ring's string splitting method — determining the best string split based on word frequency data — and the uniqueness of some blacklisted terms, not all blacklist entries are treated the same (more details [here](#b-blacklist-management)).

## Accuracy

Traditionally, blacklisted words are detected in usernames by searching for their existence anywhere in the string. This approach is very effective at identifying true positives, but results in a high rate of false positives. To compare Purity Ring against the traditional approach 2 separate tests were run 1000 times each for both methods:

1. **False Positives and True Negatives** - Generate a string with 3 random non-blacklisted words from the word frequency data.

2. **True Positives and False Negatives** - Generate a string with 1 random blacklisted word, bookended by 2 random non-blacklisted words.

|              | False Positives | True Negatives | False Negatives | True Positives | Overall |
|--------------|-----------------|----------------|-----------------|----------------|---------|
| **Purity Ring** | 0.2%           | 99.8%          | 0.5%            | 99.5%          | 99.7%    |
| **Traditional** | 20.7%          | 79.3%          | 0%              | 100%           | 89.7%   |

## Install
```bash
npm install purity-ring
```

## Usage

### Common JS

```javascript
const { validate } = require('purity-ring');
```

### ESM
```javascript
import { validate } from 'purity-ring';
```

### Examples
```javascript
// Validate a username with options: verbose and character mapping
const options = { verbose: true, characterMapping: true };
const result = await validate('passage123', options);
console.log(result);
// {
//   isBlacklisted: false,
//   blacklistMatch: undefined,
//   originalString: 'passage123',
//   substitutedString: 'passage ize'
// }

// Validate a username with options: verbose without character mapping
const options = { verbose: true, characterMapping: false };
const result = await validate('passage123', options);
console.log(result);
// {
//   isBlacklisted: false,
//   blacklistMatch: undefined,
//   originalString: 'passage123',
//   substitutedString: 'passage'
// }

// Validate a username with options: without verbose or character mapping
const options = { verbose: false, characterMapping: false };
const result = await validate('passage123', options);
console.log(result);
// { isBlacklisted: false }

// Validate a blacklisted username with options: verbose and character mapping
const options = { verbose: true, characterMapping: true };
const result = await validate('bu77head123', options);
console.log(result);
// {
//   isBlacklisted: true,
//   blacklistMatch: 'butthead',
//   originalString: 'bu77head123',
//   substitutedString: 'butthead lze'
// }

// Split a concatenated string into words with character mapping
const words = await splitString('aconcatenatedstringtobesplitintoitsc0mponentword5', true);
console.log(words);
// ["a", "concatenated", "string", "to", "be", "split", "into", "its", "component", "words"]

// Split a concatenated string into words without character mapping
const words = await splitString('anotherexamplethistimewithoutcharactermapping1234', false);
console.log(words);
// ["another","example","this","time","without","character","mapping"]

// Evaluate a list of blacklist terms to find their respective categories
const categories = await evaluateBlacklist(['butt', 'hello', 'thisisatest', 'butttest']);
console.log(categories);
// {
//   duplicate: [ 'butt' ],
//   common: [ 'hello' ],
//   special: [ 'thisisatest' ],
//   commonVariant: [ 'butttest' ]
// }

// Update the blacklist with new terms
const updatedBlacklist = await addBlacklist({
  common: [ 'hello' ],
  special: [ 'thisisatest' ],
  commonVariant: [ 'butttest' ]
});
console.log(updatedBlacklist);
// [ 'butt', 'hello', 'thisisatest' ]

// Remove terms from the blacklist
const removedWords = await removeBlacklist(['hello', 'thisisatest']);
console.log(removedWords);
// [ 'hello', 'thisisatest' ]

// Get the current blacklist
const currentBlacklist = await getBlacklist();
console.log(currentBlacklist);
// ['butttest']
```

## Future Enhancements

### Lemma-based Blacklist Management

Blacklist management could be improved by adding the ability to find a word's lemma and automatically generate inflections upon that lemma, similar to [Lemminflect](https://pypi.org/project/lemminflect/). Users would no longer need to manually identify and enter all variants of a blacklisted term. Instead, they would be presented with a list of potential inflections (e.g., plural forms, verb tenses) and could select which variants to blacklist. It could also be used to flesh out the blacklist by suggesting inflections for existing terms.

If you're interested in this feature or have any other suggestions, feel free to open a [GitHub issue](https://github.com/psullivan01/purity-ring/issues).

## Contributing

Contributions are welcome! If you have suggestions, bug reports, or ideas for enhancements, please feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature_branch`.
3. Commit your changes: `git commit -m 'add your feature'`.
4. Push to the branch: `git push origin feature_branch`.
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements

- The string splitting approach is inspired by a [Stack Overflow answer](https://stackoverflow.com/a/11642687), which references [Zipf's law](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4176592).
- The word frequency data is sourced from a repository of over 2 million words derived from 17 million Wikipedia articles: [wikipedia-word-frequency-clean](https://github.com/adno/wikipedia-word-frequency-clean). While this dataset provides a broad coverage of word frequencies, Zipf's law loses its predictive accuracy long before reaching the 2 millionth word. To optimize memory usage and processing speed, the word list was truncated to include only the top 200,000 words.
- The character mapping data is derived from the [Leet Wikipedia page](https://en.wikipedia.org/wiki/Leet).
- The default blacklist data is derived primarily from [this list](https://www.cs.cmu.edu/~biglou/resources/bad-words.txt).

## Appendix

### A. Character Mapping

If a M:M relationship were allowed, we would need to generate all possible permutations of a string given the different substitution options. This isn't a big deal if we're just dealing with one variation (e.g., `h1` could be `hi` or `hl`). However, things can get out of hand quickly when multiple instances of a character are involved.

For example, consider the word `i11icit`, where `1` could be substituted as either `i` or `l`. Here’s what the permutations would look like:

1. **Original String**: `i11icit`
2. **Possible Variations**:
   - `iiicit`
   - `illicit`
   - `liicit`
   - `lllicit`

With just two `1`s in the string, we already have two possible substitutions for each, leading to \(2^2 = 4\) total permutations. As you can see, the number of permutations increases exponentially with the number of characters and substitution options. By consolidating to a 1:M relationship, we avoid the computational complexity and performance overhead that would come with generating and processing all possible permutations.

### B. Blacklist Management

Purity Ring classifies blacklisted terms into three categories to improve accuracy:

1. **Common** -
   These are words that are readily split and matched by Purity Ring using the word frequency data. When these words are passed into the validate function, they return `isBlacklisted: true`. Common blacklisted terms are straightforward and are detected based on the string splitting logic.

2. **Common Variants** -
   These terms are variations of common blacklisted terms. Although Purity Ring might not directly match the variation itself, it matches the base form (lemma) of the word. For example, the word `goddamnit` matches based on the blacklisted word `damn`, its lemma word. Since these terms are unique enough to avoid triggering false positives, Purity Ring matches them without performing any string splitting, simply checking if the term appears anywhere in the input string (after character mapping). This allows common variants to be detected more quickly by avoiding unnecessary splits.

3. **Special** -
   Special terms are so unique or infrequent that they are difficult to match to any words in the dictionary. If a special term is passed to `validate` without being appropriately classified, it will probably result in a false negative because the word is split into safe substrings that pass validation. To address this, Purity Ring biases the results by placing these special terms at the top of the word frequency dataset, artificially lowering their cost score. This ensures that the string splitting algorithm picks up on these terms, leading to blacklist detection.

Because there are three different types of blacklist classifications, adding new terms to the blacklist requires proper classification of the terms beforehand. Purity Ring provides the `evaluateBlacklist` function to help classify an array of terms into their respective categories.

It is important to pre-process your blacklist classifications and pass the result to `addBlacklist`. Do not call `evaluateBlacklist` at runtime, especially if you have a large number of blacklisted terms to evaluate. The `evaluateBlacklist` function attempts to validate each term, performing character mapping and string splitting, so the process can be slow if it is evaluating multiple terms. Once the terms are evaluated, the resulting object (excluding the `duplicate` property), can be passed to `addBlacklist`.