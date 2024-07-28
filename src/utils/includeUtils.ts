import path from 'path';
import { RepopackConfigMerged } from '../types/index.js';

export type IncludeFilter = (path: string) => boolean;

export function createIncludeFilter(patterns: string[]): IncludeFilter {
    if (patterns.length === 0) {
      return () => true;  
    }
    const includedPatterns = new Set(patterns);
    return (filePath: string) => includedPatterns.has(filePath);
  }

export async function getAllIncludePatterns(rootDir: string, config: RepopackConfigMerged): Promise<string[]> {
  let includePatterns: string[] = [];

  if (config.include && config.include.length > 0) {
    includePatterns = config.include.map((pattern) => makePathRelative(rootDir, pattern));
  }

  return includePatterns;
}

export function makePathRelative(rootDir: string, filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return path.relative(rootDir, filePath);
  }
  return filePath;
}