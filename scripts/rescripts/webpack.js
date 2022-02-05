const { removeWebpackPlugin } = require('@rescripts/utilities')
const webpack = require('webpack')
const moduleReplacementCallback = require('../resourceFinder')

const resourcesRegex = /\$RESOURCES/
const suffixes = ['', '.js', '.tsx']

module.exports = (config) => {
  config.plugins = [
    new webpack.NormalModuleReplacementPlugin(resourcesRegex, (resource) => {
      moduleReplacementCallback(resource, suffixes)
    }),
  ]
  const webpackWithoutEsLint = removeWebpackPlugin('ESLintWebpackPlugin', config)
  return webpackWithoutEsLint
}
