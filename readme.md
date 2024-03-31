# GPTLint <!-- omit from toc -->

> A fundamentally new approach to code health. Use LLMs to enforce best practices across your codebase in a way that takes traditional static analysis tools like `eslint` to the next level.

**TL;DR** You can think of `gptlint` as `eslint++` 💪

- [Features](#features)
- [How it works](#how-it-works)
- [Install](#install)
- [Usage](#usage)
- [CLI](#cli)
- [LLM Providers](#llm-providers)
  - [OpenAI](#openai)
  - [Anthropic](#anthropic)
  - [OSS Models](#oss-models)
  - [Local Models](#local-models)
- [How it works in-depth](#how-it-works-in-depth)
  - [Author notes](#author-notes)
  - [Evals](#evals)
  - [Caveats](#caveats)
- [TODO](#todo)
- [License](#license)

## Features

- simple markdown format for specifying rules ([example](./guidelines/prefer-array-at-negative-indexing.md))
- easy to add custom, project-specific rules (_rules are just markdown files_)
- cli and config formats are ~~copied from~~ inspired by `eslint`
- content-based caching
- outputs LLM stats per run (cost, tokens, etc)
- community-driven rules
- every rule is fully configurable, both at the project level (`gptlint.config.js`) and at the rule level (markdown)
  - don't agree with a rule? simply disable it in your config like you would with `eslint` or copy the rule's markdown into your project and customize it to suit your project's needs
  - want to enforce a new best practice in your project? add a new markdown file for the rule, describe the rule's intent in natural language, add a few correct/incorrect examples, and you're good to go
  - all custom rules live in your repo as simple markdown files and are self-documenting, understandable by non-devs, and they can be improved over time via standard git workflows
  - this is the way 💯
- all built-in rules are tested extensively with a combination of _synthetic evals_ and manual test cases
  - (you can think of evals as regression test suites for possibly non-deterministic functions like the LLMs that power GPTLint)
  - this allows us to track the accuracy of GPTLint over time and improve the rules whenever we find false positives or false negatives
- ~~supports any programming language~~ (ts, py, C++, java, etc)
  - the MVP is focused on JS / TS only for now (python support coming soon)
- supports any natural language (english, chinese, spanish, etc)
- supports multiple LLM providers (openai, anthropic, [openrouter](https://openrouter.ai/), etc)
  - the MVP supports any LLM provider with an OpenAI-compatible chat completions API
  - see [LLM Providers](#llm-providers) for more info
- supports local LLMs (via [ollama](https://github.com/ollama/ollama) or [vllm](https://github.com/vllm-project/vllm))
  - see [LLM Providers](#llm-providers) for more info
- designed to be used in addition to existing static analysis tools like `eslint`, `pylint`, `ruff`, etc
- no complicated github integration, bots, or CI actions – just call the `gptlint` CLI the same way you would call a tool like `eslint`

## How it works

<p align="center">
  <img alt="How it works" src="/media/how-gptlint-works.png">
</p>

See [How it works in-depth](#how-it-works-in-depth) for more detail.

## Install

> [!CAUTION]
> This tool isn't published to `npm` yet, so use `tsx bin/lint.ts` instead of the following usage examples. This requires you to checkout the code locally and install deps with `pnpm i`.

```sh
npm install -D gptlint
```

It is recommended to install `gptlint` as a dev dep just like `eslint`.

## Usage

> [!CAUTION]
> This tool isn't published to `npm` yet, so use `tsx bin/lint.ts` instead of the following usage examples. This requires you to checkout the code locally and install deps with `pnpm i`.

```sh
echo "OPENAI_API_KEY='your openai api key'" >> .env
npx gptlint

# or

export OPENAI_API_KEY='your openai api key'
npx gptlint 'src/**/*.{js,ts,tsx}'

# or
npx gptlint -k 'your openai api key'
```

## CLI

```bash
Usage:
  gptlint [flags...] [file/dir/glob ...]

Flags:
      --api-base-url <string>               Base URL for the LLM API to use which must be compatible with the OpenAI
                                            chat completions API. Defaults to the OpenAI API (default:
                                            "https://api.openai.com/v1")
      --api-key <string>                    API key for the OpenAI-compatible LLM API. Defaults to the value of the
                                            `OPENAI_API_KEY` environment variable. (default:
                                            "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")
      --api-organization-id <string>        Optional organization ID that should be billed for LLM API requests. This is
                                            only necessary if your OpenAI API key is scoped to multiple organizations.
      --cache-dir <string>                  Customize the path to the cache directory (default:
                                            "/Users/tfischer/dev/modules/eslint++/node_modules/.cache/gptlint")
  -c, --config <string>                     Path to a configuration file
  -d, --debug                               Enables debug logging
      --debug-config                        When enabled, logs the resolved config and parsed rules and then exits
  -D, --debug-model                         Enables verbose LLM logging
  -e, --early-exit                          Exits after finding the first error
  -g, --guidelines <string>                 Glob pattern to guideline markdown files containing rule definitions
  -h, --help                                Show help
      --ignore-file <string>                Path to file containing ignore patterns (default: ".gptlintignore")
      --ignore-pattern <string>             Pattern of files to ignore (in addition to .gptlintignore)
      --model <string>                      Which LLM to use for assessing rule conformance (default:
                                            "gpt-4-turbo-preview")
  -C, --no-cache                            Disables caching
  -S, --no-debug-stats                      Disables logging of cumulative LLM stats, including total tokens and cost
                                            (logging LLM stats is enabled by default)
      --no-ignore                           Disables the use of ignore files and patterns
      --no-inline-config                    Disables the use of inline rule config inside of source files
  -r, --rules <string>                      Glob pattern to rule definition markdown files. (default:
                                            ["guidelines/**/*.md"])
      --temperature <number>                LLM temperature parameter
```

## LLM Providers

This project supports any chat LLM which exposes an OpenAI-compatible chat completions API. Specific instructions for the most popular LLM providers and local, open source models are included below.

### OpenAI

This is the default. Just export an `OPENAI_API_KEY` environment variable either via your environment, a local `.env` file, or via the CLI `--apiKey` flag.

The default model is `gpt-4`. We're not using `gpt-4-turbo-preview` as the default because some developers don't have access to it, and we're not using `gpt-3.5-turbo` as the default because it doesn't perform as consistently in our tests.

If you have access to `gpt-4-turbo-preview`, it is recommended to use over `gpt-4` by adding a [config file](./gptlint.config.js) to your project.

### Anthropic

Anthropic Claude is supported by using a proxy such as [OpenRouter](https://openrouter.ai/).

- [Claude Opus](https://openrouter.ai/models/anthropic/claude-3-opus:beta)
- [Claude Sonnet](https://openrouter.ai/models/anthropic/claude-3-sonnet:beta)
- [Claude Haiku](https://openrouter.ai/models/anthropic/claude-3-haiku:beta)

Export your OpenRouter API key as an `OPENAI_API_KEY` environment variable either via your environment, a local `.env` file, or via the CLI `--apiKey` flag.

```js
// gptlint.config.js
export default [
  {
    llmOptions: {
      apiBaseUrl: 'https://openrouter.ai/api/v1',
      model: 'anthropic/claude-3-opus:beta',
      // Optional
      kyOptions: {
        headers: {
          // Optional, for including your app on openrouter.ai rankings.
          'HTTP-Referer': 'https://github.com/GPTLint/GPTLint',
          // Optional, shows in rankings on openrouter.ai.
          'X-Title': 'gptlint'
        }
      }
    }
  }
]
```

### OSS Models

The best way to use GPTLint with OSS models is to either [host them locally](#local-models) or to use a cloud provider that offers inference and fine-tuning APIs for common OSS language models:

- [Together.ai](https://www.together.ai)
- [Anyscale](https://www.anyscale.com/private-endpoints)
- [Modal Labs](https://modal.com/use-cases/language-models)

### Local Models

- [ollama](https://github.com/ollama/ollama) supports exposing a local [OpenAI compatible server](https://github.com/ollama/ollama/blob/main/docs/openai.md) which you can point `gptlint` to.
- [vLLM](https://github.com/vllm-project/vllm) supports exposing a local [OpenAI compatible server](https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html) which you can point `gptlint` to.

Use the `apiBaseUrl` and `apiKey` config / CLI params to point GPTLint to your local model server.

## How it works in-depth

<p align="center">
  <img alt="How it works" src="/media/how-gptlint-works.png">
</p>

GPTLint lints a codebase by taking the following steps:

1. Resolves a set of markdown rule definitions along with optional few-shot examples (defaults to `guidelines/**/*.md`)
2. Resolves a set of input source files to lint (defaults to `**/*.{js,ts,jsx,tsx,cjs,mjs}`)
3. For each `[rule, file]` pair, creates a linter task
4. Filters any linter tasks which are cached from previous runs based on the contents of the rule and file
5. For each non-cached linter task, runs it through an LLM classifier with the goal of identifying rule violations
6. Parses the LLM's markdown output for a JSON code block containing an array of `RuleViolation` objects
7. Retries step #5 if the LLM output fails to validate
8. Otherwise, adds any `RuleViolation` objects to the output

The core linting logic lives in [src/lint-file.ts](./src/lint-file.ts).

<details>
<summary>
Example LLM markdown output:
</summary>

```md
# EXPLANATION

The source code provided is a TypeScript file that includes variable names, function names, and type imports. According to the "consistent-identifier-casing" rule, variable names should use camelCase, global const variable names should use camelCase, PascalCase, or CONSTANT_CASE, type names should use PascalCase, class names should use PascalCase, and function names should use camelCase.

Upon reviewing the source code, the following observations were made:

1. Variable names such as `ast`, `h1RuleNodes`, `headingRuleNode`, `bodyRuleNodes`, and `rule` are all in camelCase, which conforms to the rule.
2. Function names like `parseRuleFile`, `findAllBetween`, `findAllHeadingNodes`, `parseMarkdownAST`, and `parseRuleNode` are in camelCase, which also conforms to the rule.
3. The type import `import type * as types from './types.js'` uses PascalCase for the type alias `types`, which is acceptable since it's an import statement and the rule primarily focuses on the casing of identifiers rather than import aliases.
4. The variable `example_rule_failure` uses snake_case, which violates the rule for consistent identifier casing for variable names.

Based on these observations, the only violation found in the source code is the use of snake_case in the variable name `example_rule_failure`.

# VIOLATIONS

\`\`\`json
[
{
"ruleName": "consistent-identifier-casing",
"codeSnippet": "let example_rule_failure",
"codeSnippetSource": "source",
"reasoning": "The variable name 'example_rule_failure' uses snake_case, which violates the rule that variable names should use camelCase.",
"violation": true,
"confidence": "high"
}
]
\`\`\`
```

</details>

### Author notes

- the current version restricts rules to a single file of context. this is to simplify the MVP and will likely change in the future
- the LLM classifier outputs a markdown file with two sections, `EXPLANATION` and `VIOLATIONS`
  - the `EXPLANATION` section is important to give the LLM [time to think](https://twitter.com/karpathy/status/1708142056735228229) (a previous version without this section produced false positives a lot more frequently)
  - the `VIOLATIONS` section contains the actual structured JSON output of [RuleViolation](./src/rule-violations.ts) objects
    - `codeSnippetSource`, `reasoning`, `violation`, and `confidence` were all added empirically to increase the LLM's accuracy and to mitigate common forms of false positives
    - these false positives will sometimes still appear when using less capable models, but these additional fields still help in filtering many of them

### Evals

- [`bin/generate-evals.ts`](./bin/generate-evals.ts) is used to generate N synthetic positive and negative example code snippets for each rule under [`fixtures/evals`](./fixtures/evals)
- [`bin/run-evals.ts`](./bin/run-evals.ts) is used to evaluate rules for false negatives / false positives across their generated test fixtures

### Caveats

- this tool passes an LLM portions of your code and the rule definitions alongside few-shot examples, so depending on the LLM's settings and the quality of your rules, it's possible for the tool to produce **false positives** (hallucinated errors which shouldn't have been reported) and/or **false negatives** (real errors that the tool missed)
  - **all built-in rules are extensively tested** with evals to ensure that the linter is as accurate as possible by default
  - keep in mind that even expert human developers are unlikely to reach perfect accuracy when reviewing large codebases (we all miss things, get tired, get distracted, etc), **so the goal of this project is not to achieve 100% accuracy, but rather to surpass human expert-level accuracy at a fraction of the cost and speed**
- **LLM costs can add up quickly**
  - for a codebase with `N` files and `M` rules, each run of this tool makes `NxM` LLM calls (except for any cached calls when files and rules haven't changed between runs)
  - for instance, using `gpt-3.5-turbo` running `gptlint` on this repo with caching disabled (22 files and 8 rules) takes ~70s and costs ~$0.31 cents USD
  - for instance, using `gpt-4-turbo-preview` running `gptlint` on this repo with caching disabled (22 files and 8 rules) takes ~64s and costs ~$2.38 USD
  - NOTE: this variable cost goes away when using a local LLM, where you're instead paying directly for GPU compute instead of paying per token
  - NOTE: for many projects, this will still be several orders of magnitude cheaper than hiring senior developers to track and fix technical debt
- **rules in the MVP are single-file only**
  - many architectural patterns fundamentally span multiple files, but we wanted to keep the MVP scoped, so we made the decision to restrict rules to the context of a single file _for now_
  - this restriction will likely be removed once we've validated the initial version with the community, but it will likely remain as an optional rule setting to optimize rules which explicitly don't need multi-file context
  - if you'd like to use a rule which requires multi-file analysis, [please open an issue to discuss](https://github.com/transitive-bullshit/eslint-plus-plus/issues/new)
- **rules in the MVP focus on JS/TS only**
  - this project is inherently language-agnostic, but to keep the MVP scoped, I wanted to focus on the languages & ecosystem that I'm most familiar with
  - we're hoping that rules for other programming languages will trickle in from the community

## TODO

- rule file format
  - support both positive and negative examples in the same code block
  - add support to guidelines.md for organizing rules by h1 sections
    - alternatively, just use directories and rule.md file format
  - `prefer-page-queries.md` code examples give extra context outside of the code blocks
  - decide if we want to support the `guidelines.md` format in addition to the one-rule-per-file format
    - if we go with only the one-rule-per-file format, consider switching from an inline table to frontmatter for metadata
  - support a caveats / exceptions h2
  - support other h2s for examples / usage examples / etc
- config
  - use eslint, ruff, and conformance as inspiration
  - add ability to extend other configs
- linter engine
  - **evals**
  - gracefully respect rate limits
  - gracefully handle llm api errors like 403 / 409 for content moderation
  - add support for different LLM providers
  - test anthropic claude w/ structured output and prefill
  - add support for optionally applying automatic fixes to linter errors
  - add support for only linting changed git deltas
  - add support for different languages
  - add support for `fixable`
  - add support for [openai seed](https://platform.openai.com/docs/api-reference/chat/create#chat-create-seed) and `system_fingerprint` to help make the system more deterministic
  - handle context overflow properly depending on selected model
  - experiment with ways of making the number of LLM calls sublinear w.r.t. the number of files
    - possibly using bin packing to optimize context usage, but that's still same `O(tokens)`
    - possibly via optional regex patterns to enable / disable rules for files
  - cross-file linting; v0 is strictly local to individual files
- rules
  - add a rule which captures naming w/ types and consistency
  - if you refer to something as numIterations in one place, refer to it consistently
  - react unnecessary effects for https://react.dev/learn/you-might-not-need-an-effect
- cli
  - improve progress bar; possibly switch to [cli-progress](https://github.com/npkgz/cli-progress)
- project
  - update project name in multiple places once we decide on a name
  - decide on an OSS license
  - add a [security policy](https://github.com/Portkey-AI/gateway/blob/main/SECURITY.md)
  - basic eval graphs and blog post
  - rubric for what makes a good rule
  - publish to NPM

## License

MIT © [Travis Fischer](https://transitivebullsh.it)
