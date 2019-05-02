module.exports = {
  verbose: true,
  setupFiles: ['./src/__setup__/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
}