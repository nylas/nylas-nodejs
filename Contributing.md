# Contribute to Nylas
👍🎉 First off, thanks for taking the time to contribute! 🎉👍

The following is a set of guidelines for contributing to the Nylas Node SDK; these are guidelines, not rules, so please use your best judgement and feel free to propose changes to this document via pull request.

# How to Ask a Question

If you have a question about how to use the Node SDK, please [create an issue](https://github.com/nylas/nylas-nodejs/issues) and label it as a question. If you have more general questions about the Nylas Communications Platform, or the Nylas Email, Calendar, and Contacts API, please reach out to support@nylas.com to get help.

# How To Contribute
## Report a Bug or Request a Feature

If you encounter any bugs while using this software, or want to request a new feature or enhancement, please [create an issue](https://github.com/nylas/nylas-python/issues) to report it, and make sure you add a label to indicate what type of issue it is.

## Contribute Code

Pull requests are welcome for bug fixes. If you want to implement something new, [please request a feature](https://github.com/nylas/nylas-nodejs/issues) first so we can discuss it.

While writing your code contribution, make sure you test your changes by running

`npm test`

Our linter can be run with:

`npm run lint`

To use the package during local development, symlink the directory:

`npm link` in the `nylas-nodejs` directory
`npm link nylas` in the directory with your code that uses the package

Please ensure that your contributions don’t cause a decrease to test coverage.

## Creating a Pull Request

Please follow [best practices](https://github.com/trein/dev-best-practices/wiki/Git-Commit-Best-Practices) for creating git commits. When your code is ready to be submitted, you can [submit a pull request](https://help.github.com/articles/creating-a-pull-request/) to begin the code review process.

All PRs from contributors that aren't employed by Nylas must contain the following text in the PR description: "I confirm that this contribution is made under the terms of the MIT license and that I have the authority necessary to make this contribution on behalf of its copyright owner."

