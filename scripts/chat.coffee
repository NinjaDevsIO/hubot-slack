# Description:
#   Turns your bot into a snarky little boy.
#
# Dependencies:
#   "cleverbot-node": "0.2.1"
#
# Configuration:
#   None
#
# Commands:
#   hubot {{text}} - Chat with @hubot, you can say anything.
#   hubot chat <text> - Chat with @hubot using a specific command.
#
# Author:
#   Oscar Viquez

cleverbot = require("cleverbot-node")

module.exports = (robot) ->

  c = new cleverbot()

  # Have hubot respond to anything that is not a registered command.
  robot.respond /(.*)/i, (msg) ->

    # Checks if the first word of the message is an existing command.
    command = msg.match[1].trim()

    commands = robot.helpCommands().map (command) ->
      command.split(' ')[1]

    commandExists = commands.indexOf(command)

    # If there is no command registered send over the message to cleverbot.
    if (commandExists == -1)

      data = msg.match[1].trim()
      cleverbot.prepare(( -> c.write(data, (c) => msg.send(c.message))))


  # Have hubot respond to the chat command.
  robot.respond /chat(.*)/i, (msg) ->

    data = msg.match[1].trim()
    cleverbot.prepare(( -> c.write(data, (c) => msg.send(c.message))))

