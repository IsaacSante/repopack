# 📦 Repopack

[![Actions Status](https://github.com/yamadashy/repopack/actions/workflows/test.yml/badge.svg)](https://github.com/yamadashy/repopack/actions?query=workflow%3A"test")
[![npm](https://img.shields.io/npm/v/repopack.svg?maxAge=1000)](https://www.npmjs.com/package/repopack)
[![npm](https://img.shields.io/npm/l/repopack.svg?maxAge=1000)](https://github.com/yamadashy/repopack/blob/master/LICENSE.md)
[![node](https://img.shields.io/node/v/repopack.svg?maxAge=1000)](https://www.npmjs.com/package/repopack)

Repopack is a powerful tool that packs your entire repository into a single, AI-friendly file.  
Perfect for when you need to feed your codebase to Large Language Models (LLMs) or other AI tools like Claude or ChatGPT.



## 🌟 Features

- **AI-Optimized**: Formats your codebase in a way that's easy for AI to understand and process.
- **Simple to Use**: Just one command to pack your entire repository.
- **Customizable**: Easily configure what to include or exclude.
- **Git-Aware**: Automatically respects your .gitignore files.
- **Security-Focused**: Incorporates [Secretlint](https://github.com/secretlint/secretlint) for robust security checks to detect and prevent inclusion of sensitive information.



## 🚀 Quick Start

Try Repopack instantly in your project directory without installation:

```bash
npx repopack
```

Or install globally for repeated use:

```bash
# Install using npm
npm install -g repopack

# Or using yarn
yarn global add repopack

# Then run in any project directory
repopack
```

That's it! Repopack will generate an `repopack-output.txt` file in your current directory, containing your entire repository in an AI-friendly format.

## 📊 Usage

To pack your entire repository:

```bash
repopack
```

To pack a specific directory:

```bash
repopack path/to/directory
```

Once you have generated the packed file, you can use it with Generative AI tools like Claude or ChatGPT.


### Output File Format

Repopack generates a single file with clear separators between different parts of your codebase.  
To enhance AI comprehension, the output file begins with an AI-oriented explanation, making it easier for AI models to understand the context and structure of the packed repository.

```
================================================================
REPOPACK OUTPUT FILE
================================================================
(Metadata and usage AI instructions)

================================================================
Repository Files
================================================================

================
File: src/index.js
================
// File contents here

================
File: src/utils.js
================
// File contents here

... (remaining files)
```

### Prompt Examples

Once you have generated the packed file with Repopack, you can use it with AI tools like Claude or ChatGPT. Here are some example prompts to get you started:

#### Code Review and Refactoring
For a comprehensive code review and refactoring suggestions:

```
This file contains my entire codebase. Please review the overall structure and suggest any improvements or refactoring opportunities, focusing on maintainability and scalability.
```

#### Documentation Generation
To generate project documentation:

```
Based on the codebase in this file, please generate a detailed README.md that includes an overview of the project, its main features, setup instructions, and usage examples.
```

#### Test Case Generation
For generating test cases:

```
Analyze the code in this file and suggest a comprehensive set of unit tests for the main functions and classes. Include edge cases and potential error scenarios.
```

Feel free to modify these prompts based on your specific needs and the capabilities of the AI tool you're using.

### Command Line Options

- `-v, --version`: Show tool version
- `-o, --output <file>`: Specify the output file name
- `-i, --ignore <patterns>`: Additional ignore patterns (comma-separated)
- `-c, --config <path>`: Path to a custom config file
- `--top-files-len <number>`: Number of top files to display in the summary
- `--output-show-line-numbers`: Show line numbers in the output
- `--verbose`: Enable verbose logging

Examples:
```bash
repopack -o custom-output.txt
repopack -i "*.log,tmp" -v
repopack -c ./custom-config.json
npx repopack src
```



## ⚙️ Configuration

Create a `repopack.config.json` file in your project root for custom configurations. Here's an explanation of the configuration options:

| Option | Description | Default |
|--------|-------------|---------|
|`output.filePath`| The name of the output file | `"repopack-output.txt"` |
|`output.headerText`| Custom text to include in the file header |`null`|
|`output.removeComments`| Whether to remove comments from supported file types | `false` |
|`output.removeEmptyLines`| Whether to remove empty lines from the output | `false` |
|`output.topFilesLength`| Number of top files to display in the summary. If set to 0, no summary will be displayed |`5`|
|`output.showLineNumbers`| Whether to add line numbers to each line in the output |`false`|
|`ignore.useGitignore`| Whether to use patterns from the project's `.gitignore` file |`true`|
|`ignore.useDefaultPatterns`| Whether to use default ignore patterns |`true`|
|`ignore.customPatterns`| Additional patterns to ignore |`[]`|

Example configuration:

```json
{
  "output": {
    "filePath": "repopack-output.txt",
    "headerText": "Custom header information for the packed file.",
    "removeComments": true,
    "topFilesLength": 5,
    "showLineNumbers": false
  },
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": ["additional-folder", "*.log"]
  }
}
```

### Ignore Patterns
Repopack offers multiple methods to set ignore patterns for excluding specific files or directories during the packing process:

- **.gitignore**: By default, patterns listed in your project's `.gitignore` file are used. This behavior can be controlled with the `ignore.useGitignore` setting.
- **Default patterns**: Repopack includes a default list of commonly excluded files and directories (e.g., node_modules, .git, binary files). This feature can be controlled with the `ignore.useDefaultPatterns` setting. Please see [defaultIgnore.ts](src/utils/defaultIgnore.ts) for more details.
- **.repopackignore**: You can create a `.repopackignore` file in your project root to define Repopack-specific ignore patterns. This file follows the same format as `.gitignore`.
- **Custom patterns**: Additional ignore patterns can be specified using the `ignore.customPatterns` option in the configuration file. You can overwrite this setting with the `-i, --ignore` command line option.

Priority Order (from highest to lowest):
1. Custom patterns `ignore.customPatterns`
2. `.repopackignore`
3. `.gitignore` (if `ignore.useGitignore` is true)
4. Default patterns (if `ignore.useDefaultPatterns` is true)

This approach allows for flexible file exclusion configuration based on your project's needs. It helps optimize the size of the generated pack file by ensuring the exclusion of security-sensitive files and large binary files, while preventing the leakage of confidential information.

### Comment Removal

When `output.removeComments` is set to `true`, Repopack will attempt to remove comments from supported file types. This feature can help reduce the size of the output file and focus on the essential code content.

Supported languages include:  
HTML, CSS, JavaScript, TypeScript, Vue, Svelte, Python, PHP, Ruby, C, C#, Java, Go, Rust, Swift, Kotlin, Dart, Shell, and YAML.

Note: The comment removal process is conservative to avoid accidentally removing code. In complex cases, some comments might be retained.



## 🔍 Security Check

Repopack includes a security check feature that uses [Secretlint](https://github.com/secretlint/secretlint) to detect potentially sensitive information in your files. This feature helps you identify possible security risks before sharing your packed repository.

The security check results will be displayed in the CLI output after the packing process is complete. If any suspicious files are detected, you'll see a list of these files along with a warning message.

Example output:

```
🔍 Security Check:
──────────────────
2 suspicious file(s) detected:
1. src/utils/test.txt
2. tests/utils/secretLintUtils.test.ts

Please review these files for potential sensitive information.
```



## 📜 License
MIT
