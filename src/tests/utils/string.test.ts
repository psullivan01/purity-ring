import stringUtils from '../../utils/string';
import sanitization from '../../utils/sanitization';
import fsSync from 'fs';
import { Transform, TransformCallback } from 'stream';

const { sanitize: mockSanitize } = sanitization;

const mockWords = {
  t: 8.075289513534567,
  te: 11.188804822744942,
  tes: 13.3819056828973,
  test: 9.505643864448487,
  tests: 10.651951026924614,
  e: 8.161549857818974,
  es: 11.68340340117789,
  est: 11.623274627596286,
  ests: 14.923050883921025,
  s: 5.157518781450287,
  st: 7.683247425758543,
  sts: 12.208219336417523,
  stst: 16.819952739380668,
  ts: 12.385786277474908,
  tst: 14.076704391495717,
  str: 13.227591189489528,
  stri: 14.70944922394687,
  string: 10.783039369237311,
  tr: 12.296980842407123,
  tri: 11.674204832607993,
  trin: 14.649296769780923,
  tring: 13.615510296516163,
  r: 8.893202301762027,
  ri: 12.190731277789373,
  rin: 12.88999759878109,
  ring: 10.155856547736137,
  i: 7.103428930505601,
  in: 3.771224420330397,
  ing: 12.025839991187018,
  n: 9.222262873896097,
  ng: 11.769895781346174,
  g: 8.85262878531486,
};
const mockMaxWordLength = 6;

jest.mock('../../utils/sanitization', () => ({
  sanitize: jest.fn(),
}));

jest.mock('../../utils/blacklist', () => ({
  getBlacklist: jest.fn().mockResolvedValue({ special: ['term1', 'term2'] }),
}));

jest.mock('zlib', () => {
  const actualZlib = jest.requireActual('zlib');
  return {
    ...actualZlib,
    createGunzip: jest.fn(() => {
      class MockGunzip extends Transform {
        bytesRead = 0;
        bytesWritten = 0;

        _transform(
          chunk: Buffer,
          _: BufferEncoding,
          callback: TransformCallback
        ) {
          this.push(chunk);
          callback();
        }

        close() {}
      }

      return new MockGunzip();
    }),
  };
});

describe('stringUtils', () => {
  const testString = 'teststring';
  const testStringLength = testString.length;
  const testStringCosts = [
    0, 8.075289513534567, 11.188804822744942, 13.3819056828973,
    9.505643864448487, 10.651951026924614, 17.18889129020703,
    22.733235053938017, 22.326155859532605, 25.30124779670554, 20.2886832336858,
  ];

  describe('getChunkFilePath', () => {
    it('should return the correct file path for a given chunk name', () => {
      const chunkName = 'a-ba';
      const expectedFilePath = `/data/${chunkName}.json.gz`;

      const result = stringUtils.getChunkFilePath(chunkName);

      expect(result).toContain(expectedFilePath);
    });
  });

  describe('getConsecutivePermutations', () => {
    it('should generate all consecutive permutations of the input string', () => {
      const inputString = 'abc';
      const expectedPermutations = ['a', 'ab', 'abc', 'b', 'bc', 'c'];

      const result = stringUtils.getConsecutivePermutations(inputString);

      expect(result).toEqual(expectedPermutations);
    });
  });

  describe('chunkBinarySearch', () => {
    it('should find the correct chunk array for a given string', () => {
      const inputString = 'test';
      const expectedChunk = ['sw-ur'];

      const result = stringUtils.chunkBinarySearch(inputString);

      expect(result).toEqual(expectedChunk);
    });

    it('should find the correct chunk array for a start boundary word', () => {
      const inputString = 'cr';
      const expectedChunk = ['ca-cr', 'cr-el'];

      const result = stringUtils.chunkBinarySearch(inputString);

      expect(result).toEqual(expectedChunk);
    });

    it('should find the correct chunk array for an end boundary word', () => {
      const inputString = 'pa';
      const expectedChunk = ['my-pa', 'pa-re'];

      const result = stringUtils.chunkBinarySearch(inputString);

      expect(result).toEqual(expectedChunk);
    });

    it('should find the correct chunk array for a start boundary word at the beginning', () => {
      const inputString = 'a';
      const expectedChunk = ['a-ba'];

      const result = stringUtils.chunkBinarySearch(inputString);

      expect(result).toEqual(expectedChunk);
    });

    it('should find the correct chunk array for an end boundary word at the end', () => {
      const inputString = 'zz';
      const expectedChunk = ['ur-zz'];

      const result = stringUtils.chunkBinarySearch(inputString);

      expect(result).toEqual(expectedChunk);
    });

    it('should return null if no matching chunk is found', () => {
      const inputString = '123';

      const result = stringUtils.chunkBinarySearch(inputString);

      expect(result).toBeNull();
    });
  });

  describe('processChunkStream', () => {
    it('should process a chunk stream and update the words object', async () => {
      const filePath = './mockChunk.json';
      const permutationsArr = ['str', 'string'];

      jest.spyOn(fsSync, 'createReadStream').mockImplementation(() => {
        const readableStream = new Transform({
          transform(chunk, _, callback) {
            this.push(chunk);
            callback();
          },
        });

        readableStream.push(
          JSON.stringify({
            str: 5.0,
            string: 10.0,
          })
        );
        readableStream.push(null);

        return readableStream as unknown as fsSync.ReadStream;
      });

      await stringUtils.processChunkStream(filePath, permutationsArr);

      expect(stringUtils.words).toEqual({
        str: 14.707986231059389,
        string: 14.70796123024686,
      });
    });
  });

  describe('fetchAndProcessChunks', () => {
    it('should fetch and process all relevant chunks for the input string', async () => {
      jest
        .spyOn(stringUtils, 'processChunkStream')
        .mockImplementation(() => Promise.resolve());

      await stringUtils.fetchAndProcessChunks('string');

      expect(stringUtils.processChunkStream).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array)
      );
    });
  });

  describe('bestMatch', () => {
    it('should return the best match for a given index', () => {
      stringUtils.words = mockWords;
      stringUtils.maxWordLength = mockMaxWordLength;

      const index = 5;

      const result = stringUtils.bestMatch(index, testString, testStringCosts);

      expect(result).toEqual({ matchCost: 10.651951026924614, matchLength: 5 });
    });
  });

  describe('recursiveSplit', () => {
    it('should recursively split a string and accumulate the results', () => {
      const result = stringUtils.recursiveSplit(
        testStringLength,
        testString,
        testStringCosts,
        []
      );

      expect(result).toEqual(['test', 'string']);
    });

    it('should throw an error if there is a cost mismatch', () => {
      const costs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const acc: string[] = [];

      expect(() => {
        stringUtils.recursiveSplit(testStringLength, testString, costs, acc);
      }).toThrow('Cost Mismatch');
    });
  });

  describe('getCosts', () => {
    it('should compute an array of costs for splitting a string', () => {
      const result = stringUtils.getCosts(testString);

      expect(result).toEqual(testStringCosts);
    });
  });

  describe('splitString', () => {
    it('should split a string into its component words', async () => {
      (mockSanitize as jest.Mock).mockReturnValue(testString);

      const result = await stringUtils.splitString(testString);

      expect(result).toEqual(['test', 'string']);
    });
  });
});
