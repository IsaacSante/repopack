import * as fs from 'fs/promises';
import path from 'path';
import type { SecretLintCoreResult } from '@secretlint/types';
import { RepopackConfigMerged } from '../types/index.js';
import { processFile as defaultProcessFile } from '../utils/fileHandler.js';
import {
  getAllIgnorePatterns as defaultGetAllIgnorePatterns,
  createIgnoreFilter as defaultCreateIgnoreFilter,
  IgnoreFilter,
} from '../utils/ignoreUtils.js';
import { getAllIncludePatterns, createIncludeFilter, IncludeFilter } from '../utils/includeUtils.js';
import { generateOutput as defaultGenerateOutput } from './outputGenerator.js';
import { checkFileWithSecretLint, createSecretLintConfig } from '../utils/secretLintUtils.js';
import { logger } from '../utils/logger.js';

export interface Dependencies {
  getAllIgnorePatterns: typeof defaultGetAllIgnorePatterns;
  createIgnoreFilter: typeof defaultCreateIgnoreFilter;
  processFile: typeof defaultProcessFile;
  generateOutput: typeof defaultGenerateOutput;
  getAllIncludePatterns: typeof getAllIncludePatterns;
  createIncludeFilter: typeof createIncludeFilter;
}

export interface PackResult {
  totalFiles: number;
  totalCharacters: number;
  fileCharCounts: Record<string, number>;
  suspiciousFilesResults: SecretLintCoreResult[];
}

export interface PackedFile {
  path: string;
  content: string;
}

export async function pack(
  rootDir: string,
  config: RepopackConfigMerged,
  deps: Dependencies = {
    getAllIgnorePatterns: defaultGetAllIgnorePatterns,
    createIgnoreFilter: defaultCreateIgnoreFilter,
    processFile: defaultProcessFile,
    generateOutput: defaultGenerateOutput,
    getAllIncludePatterns: getAllIncludePatterns,
    createIncludeFilter: createIncludeFilter, 
  },
): Promise<PackResult> {
  // Get ignore patterns
  const ignorePatterns = await deps.getAllIgnorePatterns(rootDir, config);
  const ignoreFilter = deps.createIgnoreFilter(ignorePatterns);

  // Get include patterns
  const includePatterns = await deps.getAllIncludePatterns(rootDir, config);
  const includeFilter = deps.createIncludeFilter(includePatterns);

  // Get all file paths in the directory
  const filePaths = await getFilePaths(rootDir, '', ignoreFilter, includeFilter, includePatterns);

  // Perform security check
  const suspiciousFilesResults = await performSecurityCheck(filePaths, rootDir);

  // Pack files and generate output
  const packedFiles = await packFiles(filePaths, rootDir, config, deps);
  await deps.generateOutput(rootDir, config, packedFiles);

  // Metrics
  const totalFiles = packedFiles.length;
  const totalCharacters = packedFiles.reduce((sum, file) => sum + file.content.length, 0);
  const fileCharCounts: Record<string, number> = {};
  packedFiles.forEach((file) => {
    fileCharCounts[file.path] = file.content.length;
  });

  return {
    totalFiles,
    totalCharacters,
    fileCharCounts,
    suspiciousFilesResults,
  };
}

async function getFilePaths(
  dir: string,
  relativePath: string,
  ignoreFilter: IgnoreFilter,
  includeFilter: IncludeFilter,
  includePatterns: string[],
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    const entryRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      const subDirPaths = await getFilePaths(path.join(dir, entry.name), entryRelativePath, ignoreFilter, includeFilter, includePatterns);
      filePaths.push(...subDirPaths);
    } else {
      const isIgnored = ignoreFilter(entryRelativePath);
      if (isIgnored) {
        logger.trace(`Ignoring file: ${entryRelativePath}`);
        continue;
      }

      const isIncluded = includePatterns.length === 0 || includePatterns.includes(entryRelativePath) || includeFilter(entryRelativePath);
      if (isIncluded) {
        logger.trace(`Including file: ${entryRelativePath}`);
        filePaths.push(entryRelativePath);
      } else {
        logger.trace(`Ignoring file (does not match include filter): ${entryRelativePath}`);
      }
    }
  }

  return filePaths;
}

async function performSecurityCheck(filePaths: string[], rootDir: string): Promise<SecretLintCoreResult[]> {
  const secretLintConfig = createSecretLintConfig();
  const suspiciousFilesResults: SecretLintCoreResult[] = [];

  for (const filePath of filePaths) {
    const fullPath = path.join(rootDir, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const secretLintResult = await checkFileWithSecretLint(fullPath, content, secretLintConfig);
    const isSuspicious = secretLintResult.messages.length > 0;
    if (isSuspicious) {
      suspiciousFilesResults.push(secretLintResult);
    }
  }

  return suspiciousFilesResults;
}

async function packFiles(
  filePaths: string[],
  rootDir: string,
  config: RepopackConfigMerged,
  deps: Dependencies,
): Promise<PackedFile[]> {
  const packedFiles: PackedFile[] = [];

  for (const filePath of filePaths) {
    const fullPath = path.join(rootDir, filePath);
    const content = await deps.processFile(fullPath, config);
    if (content) {
      packedFiles.push({ path: filePath, content });
    }
  }

  return packedFiles;
}
