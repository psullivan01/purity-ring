export type AddSanitizedFunction = (terms: string | string[]) => Set<string>;

export type BlacklistUpdate =
  | { common: string[] }
  | { commonVariant: string[] }
  | { special: string[] }
  | { common: string[]; commonVariant?: string[] }
  | { commonVariant: string[]; special?: string[] }
  | { common: string[]; special?: string[] }
  | { common: string[]; commonVariant: string[]; special?: string[] }
  | { common: string[]; commonVariant: string[]; special: string[] };

export type AddBlacklistFunction = (
  update: BlacklistUpdate
) => Promise<string[]>;

export type RemoveBlacklistFunction = (
  update: string | string[]
) => Promise<string[]>;

export type GetBlacklistFunction = () => Promise<Record<string, string[]>>;

export type BlacklistEvaluationResult = {
  common?: string[];
  commonVariant?: string[];
  special?: string[];
  duplicate?: string[];
};

export interface BlacklistUtils {
  blacklistPath: () => string;
  addSanitized: AddSanitizedFunction;
  addBlacklist: AddBlacklistFunction;
  removeBlacklist: RemoveBlacklistFunction;
  getBlacklist: GetBlacklistFunction;
}

export type ProcessStringFunction = (input: string) => string;

export type SanitizeFunction = (
  input: string,
  characterMapping: boolean
) => string;

export type RemoveSpecialCharactersFunction = (input: string) => string;

export interface Sanitization {
  leet: Record<string>;
  processString: ProcessStringFunction;
  sanitize: SanitizeFunction;
  removeSpecialCharacters: RemoveSpecialCharactersFunction;
}

export type ValidateFunction = (
  input: string,
  options?: {
    verbose?: boolean;
    characterMapping?: boolean;
  }
) => Promise<{
  isBlacklisted: boolean;
  blacklistMatch?: string;
  originalString?: string;
  substitutedString?: string;
}>;

export type Term = string;

export type EvaluateBlacklistFunction = (
  evalArr: Term[]
) => Promise<Record<string, string[]>>;

export interface Validation {
  validate: ValidateFunction;
  evaluateBlacklist: EvaluateBlacklistFunction;
}

export type BestMatchFunction = (
  index: number,
  string: string,
  costs: number[]
) => { matchCost: number; matchLength: number };

export type RecursiveSplitFunction = (
  x: number,
  string: string,
  costs: number[],
  acc: string[]
) => string[];

export type GetCostsFunction = (string: string) => number[];

export type SplitStringFunction = (
  string: string,
  characterMapping?: boolean
) => Promise<string[]>;

export type GetConsecutivePermutationsFunction = (
  inputString: string
) => string[];

export type ChunkBinarySearchFunction = (str: string) => string[] | null;

export type ProcessChunkStreamFunction = (
  filePath: string,
  permutationsArr: string[]
) => Promise<void>;

export type FetchAndProcessChunksFunction = (
  inputString: string
) => Promise<void>;

export type GetChunkFilePathFunction = (chunkName: string) => string;

export interface StringUtils {
  words: Record<string, number>;
  specialBlacklist: Record<string, number>;
  maxWordLength: number;
  dictionaryLength: number;
  maxCost: number;
  chunkManifest: string[];
  getChunkFilePath: GetChunkFilePathFunction;
  getConsecutivePermutations: GetConsecutivePermutationsFunction;
  chunkBinarySearch: ChunkBinarySearchFunction;
  processChunkStream: ProcessChunkStreamFunction;
  prepareSpecialBlacklist: () => Promise<void>;
  fetchAndProcessChunks: FetchAndProcessChunksFunction;
  bestMatch: BestMatchFunction;
  getCosts: GetCostsFunction;
  recursiveSplit: RecursiveSplitFunction;
  splitString: SplitStringFunction;
}

type WordsData = {
  maxWordLength: number;
  words: Record<string, number>;
};
