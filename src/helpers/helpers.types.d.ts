export type GetDirNameFunction = () => string;

export type MeasureTimeFunction = <T>(
  fn: (...args: any[]) => T,
  ...args: any[]
) => T;

export type MeasureTimeAsyncFunction = <T>(
  fn: (...args: any[]) => Promise<T>,
  ...args: any[]
) => Promise<T>;

export type WriteJsonFileFunction = (
  path: string,
  json: Record<string, any>
) => Promise<void>;

export type GetJonsFileFunction = (
  file: string
) => Promise<any[] | Record<string[], any>>;

export interface Helpers {
  measureTime: MeasureTimeFunction;
  measureTimeAsync: MeasureTimeAsyncFunction;
  writeJsonFile: WriteJsonFileFunction;
  getJsonFile: GetJonsFileFunction;
  getDirname: GetDirNameFunction;
}
