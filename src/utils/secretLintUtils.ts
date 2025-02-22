import type { SecretLintCoreConfig, SecretLintCoreResult } from '@secretlint/types';
import { lintSource } from '@secretlint/core';
import { creator } from '@secretlint/secretlint-rule-preset-recommend';
import { logger } from './logger.js';

export async function checkFileWithSecretLint(
  filePath: string,
  content: string,
  config: SecretLintCoreConfig,
): Promise<SecretLintCoreResult> {
  const result = await lintSource({
    source: {
      filePath: filePath,
      content: content,
      ext: filePath.split('.').pop() || '',
      contentType: 'text',
    },
    options: {
      config: config,
    },
  });

  if (result.messages.length > 0) {
    logger.trace(`Found ${result.messages.length} issues in ${filePath}`);
    logger.trace(result.messages.map((message) => `  - ${message.message}`).join('\n'));
  }

  return result;
}

export function createSecretLintConfig(): SecretLintCoreConfig {
  return {
    rules: [
      {
        id: '@secretlint/secretlint-rule-preset-recommend',
        rule: creator,
      },
    ],
  };
}
