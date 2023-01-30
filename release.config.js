const packageJSON = require('./package.json')
const _ = require('lodash')

const dockerImageName = `${_.kebabCase(packageJSON.author)}/${_.kebabCase(packageJSON.name)}`

module.exports = {
  plugins: [
    // Determine the type of the release: major, minor or patch
    '@semantic-release/commit-analyzer',
    // Generate changelog in memory
    '@semantic-release/release-notes-generator',
    // Write changelog file
    '@semantic-release/changelog',
    // Update version in package.json
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    // Build a new docker image
    [
      '@semantic-release/exec',
      {
        prepareCmd: `docker build -t ${dockerImageName} .`,
      },
    ],
    // Push the image to the registry
    [
      'semantic-release-docker',
      {
        registryUrl: 'ghcr.io',
        name: dockerImageName,
      },
    ],
    // Push the changes to the git repo
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message:
          // eslint-disable-next-line no-template-curly-in-string
          'chore: 🔖 release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    // Make GitHub release
    '@semantic-release/github',
  ],
}
