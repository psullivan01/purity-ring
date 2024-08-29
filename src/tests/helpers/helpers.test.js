import { promises as fs } from 'fs';
import helpers from '../../helpers/helpers.js';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('helpers', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  describe('measureTime', () => {
    it('should measure the execution time of a function and return its result', () => {
      const mockFn = jest.fn((x, y) => x + y);
      const result = helpers.measureTime(mockFn, 2, 3);

      expect(mockFn).toHaveBeenCalledWith(2, 3);
      expect(result).toBe(5);
    });

    it('should log the computation time', () => {
      const mockFn = jest.fn(() => {});

      helpers.measureTime(mockFn);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Computation time:')
      );
    });
  });

  describe('writeJsonFile', () => {
    it('should write a JSON object to a file', async () => {
      const mockPath = './test';
      const mockJson = { key: 'value' };

      jest.spyOn(fs, 'writeFile').mockResolvedValue();

      await helpers.writeJsonFile(mockPath, mockJson);

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockPath,
        JSON.stringify(mockJson, null, 2)
      );
    });

    it('should log a success message when file is written successfully', async () => {
      const mockPath = './test.json';
      const mockJson = { key: 'value' };

      jest.spyOn(fs, 'writeFile').mockResolvedValue();

      await helpers.writeJsonFile(mockPath, mockJson);

      expect(console.log).toHaveBeenCalledWith(
        `File successfully written to ${mockPath}`
      );
    });

    it('should log an error message if there is an error writing the file', async () => {
      const mockPath = './test.json';
      const mockJson = { key: 'value' };
      const mockError = new Error('Write failed');

      jest.spyOn(fs, 'writeFile').mockRejectedValue(mockError);

      await helpers.writeJsonFile(mockPath, mockJson);

      expect(console.error).toHaveBeenCalledWith(
        'Error writing file:',
        mockError
      );
    });
  });
});
