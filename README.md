# Purity Ring

<img src="assets/the-one-ring.jpeg" alt="The One Ring" width="200"/>


**Version**: 1.0.0  
**Description**: Sanitize usernames by splitting concatenated strings, substituting numbers/special characters for letters, and checking for blacklisted terms.

## Overview

Purity Ring was created to address the challenge of detecting profane or inappropriate usernames, which are often submitted as concatenated strings where numbers or special characters are used instead of letters. Traditional methods often result in a high rate of false positives -- such as mistakenly rejecting the word "assassin" due to the presence of the blacklisted substring "ass".

To solve this, Purity Ring:

- Splits usernames into component words.
- Optionally substitutes numbers and special characters for their corresponding letters.
- Checks the resulting words against a blacklist.

## Features

### 1. String Splitting
Purity Ring uses pre-processed word cost data to split concatenated strings into their most likely component words.

### 2. Character Mapping

After splitting a string, Purity Ring allows users to optionally map special characters and numbers to their corresponding letters. In the interest of performance, special characters that could be mapped to multiple letters have been consolidated to their most likely use case. This decision enforces a **1:M** (one-to-many) relationship for letters to characters, as opposed to a **M:M** (many-to-many) relationship.

#### Why 1:M Mapping?

If a M:M relationship were allowed, we would need to generate all possible permutations of a string given the different substitution options. This isn't a big deal if we're just dealing with one variation (e.g., `h1` could be `hi` or `hl`). However, things can get out of hand quickly when multiple instances of a character are involved.

For example, consider the word `i11icit`, where `1` could be substituted as either `i` or `l`. Here’s what the permutations would look like:

1. **Original String**: `i11icit`
2. **Possible Variations**:  
   - `iiicit`
   - `illicit`
   - `liicit`
   - `lllicit`

With just two `1`s in the string, we already have 2 possible substitutions for each, leading to \(2^2 = 4\) total permutations. As you can see, the number of permutations increases exponentially as the number of characters and substitution options increases. By consolidating to a 1:M relationship, we avoid the computational complexity and performance overhead that would come with generating and processing all possible permutations.

### 3. Blacklist Management
Purity Ring provides a flexible blacklist management system. While there isn't a definitive list of blacklisted terms out there, Purity Ring allows users to aggregate terms from various publicly available lists and to add their own terms.

## Usage

```javascript
const purityRing = require('purity-ring');

// Validate a username with options: verbose and character mapping
const options = { verbose: true, characterMapping: true };
const result = purityRing.validate('assassin123', options);
console.log(result);
// {
//   isBlacklisted: false,
//   blacklistMatch: undefined,
//   originalString: 'assasin123',
//   substitutedString: 'assasin lze'
// }

// Validate a username with options: verbose without character mapping
const options = { verbose: true, characterMapping: false };
const result = purityRing.validate('assassin123', options);
console.log(result);
// {
//   isBlacklisted: false,
//   blacklistMatch: undefined,
//   originalString: 'assasin123',
//   substitutedString: 'assasin'
// }

// Validate a username with options: without verbose or character mapping
const options = { verbose: false, characterMapping: false };
const result = purityRing.validate('assassin123', options);
console.log(result);
// { isBlacklisted: false }

// Validate a blacklisted username with options: verbose and character mapping
const options = { verbose: true, characterMapping: true };
const result = purityRing.validate('bu77head123', options);
console.log(result);
// {
//   isBlacklisted: true,
//   blacklistMatch: 'butthead',
//   originalString: 'bu77head123',
//   substitutedString: 'butthead lze'
// }

// Split a concatenated string into words with character mapping
const words = purityRing.splitString('aconcatenatedstringtobesplitintoitsc0mponentword5', true);
console.log(words);
// ["a", "concatenated", "string", "to", "be", "split", "into", "its", "component", "words"]

// Split a concatenated string into words without character mapping
const words = purityRing.splitString('anotherexamplethistimewithoutcharactermapping1234', false);
console.log(words);
// ["another","example","this","time","without","character","mapping"]

// Update the blacklist with new terms
const updatedBlacklist = await purityRing.addBlacklist(['badword', 'anotherBadword']);
console.log(updatedBlacklist);
// ['badword', 'anotherBadword']

// Remove terms from the blacklist
const removedBlacklist = await purityRing.removeBlacklist(['badword']);
console.log(removedBlacklist);
// ['badword']

// Get the current blacklist
const currentBlacklist = await purityRing.getBlacklist();
console.log(currentBlacklist);
// ['anotherBadword']
```

### Acknowledgements

- The string splitting approach is inspired by a [Stack Overflow answer](https://stackoverflow.com/a/11642687), which references [Zipf's law](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4176592).
- The word frequency data is sourced from a repository of over 2 million words derived from 17 million Wikipedia articles: [wikipedia-word-frequency-clean](https://github.com/adno/wikipedia-word-frequency-clean).
- The character mapping data is derived from the [Leet Wikipedia page](https://en.wikipedia.org/wiki/Leet).
- The default blacklist data is derived primarily from [this list](https://www.cs.cmu.edu/~biglou/resources/bad-words.txt)

## Running Tests

```bash
npm run test
```

To test a specific file, use:

```bash
npm run test:file <filename>
```
