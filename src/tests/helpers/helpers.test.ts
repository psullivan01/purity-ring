import { jest } from '@jest/globals';
import { promises as fs } from 'fs';
import helpers from '../../helpers/helpers';
import path from 'path';

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
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  describe('measureTime', () => {
    it('should measure the execution time of a function and return its result', () => {
      const mockFn = jest.fn((x: number, y: number) => x + y);
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

  describe('measureTimeAsync', () => {
    it('should measure the execution time of an async function and return its result', async () => {
      const mockFn = jest.fn(async (x: number, y: number) => x + y);
      const result = await helpers.measureTimeAsync(mockFn, 2, 3);

      expect(mockFn).toHaveBeenCalledWith(2, 3);
      expect(result).toBe(5);
    });

    it('should log the computation time for async function', async () => {
      const mockFn = jest.fn(async () => {});

      await helpers.measureTimeAsync(mockFn);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Computation time:')
      );
    });
  });

  describe('writeJsonFile', () => {
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

  describe('getJsonFile', () => {
    it('should fetch a JSON object from a file', async () => {
      const mockPath = './test.json';
      const mockData = { key: 'value' };

      jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockData));

      const result = await helpers.getJsonFile(mockPath);

      expect(result).toEqual(mockData);
    });

    it('should log an error message if there is an error reading or parsing the file', async () => {
      const mockPath = './test.json';
      const mockError = new Error('Read failed');

      jest.spyOn(fs, 'readFile').mockRejectedValue(mockError);

      await expect(helpers.getJsonFile(mockPath)).rejects.toThrow(mockError);

      expect(console.error).toHaveBeenCalledWith(
        `Error reading or parsing the ${mockPath} file:`,
        mockError
      );
    });
  });

  describe('getDirname', () => {
    it('should return the result from path.dirname if __dirname is undefined', () => {
      const mockedDirname = 'src/helpers';

      Object.defineProperty(global, '__dirname', {
        value: 'test',
        writable: true,
      });

      jest.spyOn(path, 'dirname').mockReturnValue(mockedDirname);

      const result = helpers.getDirname();

      expect(result).toContain(mockedDirname);
    });

    it('should return the mocked __dirname if defined', () => {
      const mockedDirname = 'src/helpers';

      Object.defineProperty(global, '__dirname', {
        value: mockedDirname,
        writable: true,
      });

      const result = helpers.getDirname();

      expect(result).toContain(mockedDirname);
    });
  });
});
