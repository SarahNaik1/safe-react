const fs = require('fs')
const { functions } = require('lodash')
const path = require('path')

const resourcesRegex = /\$RESOURCES/

module.exports = function moduleReplacementCallback(resource, suffixes) {
  const context = path.resolve(resource.context, resource.request)
  const channel = process.env.REACT_APP_CHANNEL.toLowerCase()

  const contextReplacement = [`${channel}`, `default/${channel}`, 'default', '/']

  for (let y = 0; y < suffixes.lenght; y++) {
    const suffix = suffixes[y]

    for (let x = 0; x < contextReplacement.length; x++) {
      if (pathExists(context, suffix, contextReplacement[x])) {
        console.log(contextReplacement[x], 'resource')
        resource.request = resource.request.replace(resourcesRegex, contextReplacement[x]) + suffix
        return
      }
    }
  }
  resource.request = path.resolve(__dirname, 'emptyFile.js')
}

function pathExists(context, suffix, contextReplacement) {
  return fs.existsSync(context.replace(resourcesRegex, contextReplacement) + suffix)
}
