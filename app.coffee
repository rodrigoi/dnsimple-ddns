express = require "express"
log4js = require "log4js"
fs = require "fs"

dnsimple = require "./lib/dnsimple.js"


logger = log4js.getLogger "console"

app = express.createServer()

app.use log4js.connectLogger(logger, level: log4js.levels.INFO )

settings = JSON.parse fs.readFileSync "./settings.json"

app.get "/", (request, response) -> response.send "nothing to see here"
app.get "/update", (request, response) -> 
	dns = new dnsimple settings
	dns.update request.query["ip"]
	response.send json: "object"

process.on "uncaughtException", (error) -> logger.error error
process.nextTick -> logger.debug "tick"

port = process.env.PORT || 3000

app.listen port, -> logger.info "application listening on port #{port}"