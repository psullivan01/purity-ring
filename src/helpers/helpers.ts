import { promises as fs } from 'fs';
import { resolve, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';
import type { Helpers } from './helpers.types.d.ts';

const helpers: Helpers = {
  /**
   * Measures the execution time of a given function and logs the time taken.
   */
  measureTime: (fn, ...args) => {
    const startTime = Date.now();
    const result = fn(...args);

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    console.log(`Computation time: ${elapsedTime}ms`);

    return result;
  },

  /**
   * Measures the execution time of a given asynchronous function and logs the time taken.
   */
  measureTimeAsync: async (fn, ...args) => {
    const startTime = Date.now();
    const result = await fn(...args);
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    console.log(`Computation time: ${elapsedTime}ms`);

    return result;
  },

  /**
   * Asynchronously writes a JSON object to a file at the specified path.
   */
  writeJsonFile: async (file, json) => {
    try {
      const filePath = resolve(file);
      await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    } catch (err) {
      console.error('Error writing file:', err);
    }
  },

  /**
   * Asynchronously fetch a JSON object from a file at the specified path.
   */
  getJsonFile: async (file) => {
    try {
      const filePath = resolve(file);
      const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));

      return data;
    } catch (err) {
      console.error(`Error reading or parsing the ${file} file:`, err);

      throw err;
    }
  },

  /**
   * Get the dirname.
   */
  getDirname: () => {
    /* istanbul ignore next */
    const dirname =
      typeof __dirname !== 'undefined'
        ? __dirname
        : pathDirname(fileURLToPath(import.meta.url));

    return dirname;
  },
};

export default helpers;
