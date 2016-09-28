# Description:
#   "Estos son todos los comandos de hubot y frases que escucha."
#
# Commands:
#   hubot saluda - Despliega un saludo de parte de la comunidad.
#   hubot regaña a <usuario> - Regaña a un usuario.
#   te odio hubot - Muestra tu odio hacia hubot.
#

module.exports = (robot) ->
  #
  # COMANDO: hubot saluda
  #
  robot.respond /saluda/i, (msg) ->
    msg.send "Saludos de parte de 18Techs!"

  #
  # COMANDO: hubot regaña a <user name>
  #
  robot.respond /regaña a (.*)/i, (msg) ->
    subject = msg.match[1];
    msg.send "Mal, muy mal " + subject

  #
  # ESCUCHA: te odio hubot.
  #
  robot.hear /te odio hubot/i, (msg) ->
    msg.send "y yo a ti humano..."

  # enterReplies = ['Hola']

  # robot.enter (res) ->
  #   res.send res.random enterReplies
