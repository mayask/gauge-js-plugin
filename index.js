
var fs = require('fs')
var Module = require('module')
var path = require('path')

var CWD = process.cwd()

function createPlugin(name, cb) {
  return {
    init: cb
  }
}

function loadPlugin(name, options) {
  var pluginPkgName = (name.indexOf('gauge-') === 0 ? '' : 'gauge-') + name
  var plugin = require(resolvePlugin(pluginPkgName))
  plugin.init(options)
}

function init() {
  var configPath = CWD + '/.gaugerc'
  var config = {
    plugins: []
  }

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    if (!config.plugins) {
      config.plugins = []
    }
  }

  config.plugins.forEach(function (plugin) {
    if (!config[plugin]) {
      config[plugin] = {}
    }

    loadPlugin(plugin, config[plugin])
  })
}

var relativeModules = {}

function resolvePlugin(location, relative) {
  relative = relative || CWD

  var relativeMod = relativeModules[relative]

  if (!relativeMod) {
    relativeMod = new Module

    var filename = path.join(relative, ".gaugerc")
    relativeMod.id = filename
    relativeMod.filename = filename

    relativeMod.paths = Module._nodeModulePaths(relative)
    relativeModules[relative] = relativeMod
  }

  try {
    return Module._resolveFilename(location, relativeMod)
  } catch (err) {
    return null
  }
}

module.exports = createPlugin
module.exports.init = init
