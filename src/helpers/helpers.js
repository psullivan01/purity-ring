import { promises as fs } from 'fs';

const helpers = {
  /**
   * Measures the execution time of a given function and logs the time taken.
   *
   * @param {Function} fn - The function to be executed and timed.
   * @param {...any} args - The arguments to pass to the function `fn`.
   * @returns {any} - The result of the function `fn`.
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
   * Asynchronously writes a JSON object to a file at the specified path.
   *
   * @param {string} path - The path where the JSON file should be written.
   * @param {Object} json - The JSON object to write to the file.
   * @returns {Promise<void>} - A Promise that resolves when the file has been successfully written, or rejects if an error occurs.
   */
  writeJsonFile: async (path, json) => {
    try {
      await fs.writeFile(path, JSON.stringify(json, null, 2));
      console.log(`File successfully written to ${path}`);
    } catch (err) {
      console.error('Error writing file:', err);
    }
  },
};

export default helpers;
