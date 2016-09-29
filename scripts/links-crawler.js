/*
 * Description:
 *   Listen for links and send them to Trello
 *
 * Dependencies:
 *   None
 *
 * Configuration:
 *   None
 *
 * Commands:
 *   None
 *
 * Author:
 *   diestrin
 */

var SiteMeta = require('site-meta')();
var Trello = require('trello');

module.exports = function (robot) {
  var blackList = [];
  var blackListExtensions = [];
  var listenChannel = false;
  var postToChannel = false;

  var trelloKey = '';
  var trelloSecret = '';
  var trelloList = '';
  var trello = null;

  var isUrlAllowed = function (url) {
    for (var i = 0, l = blackList.length; i < l; i++) {
      if (url.indexOf(blackList[i]) >= 0) {
        return false;
      }
    }

    var re;
    for (var i = 0, l = blackListExtensions.length; i < l; i++) {
      re = new RegExp('\\.' + blackListExtensions[i] + '$|\\.' + blackListExtensions[i] + '\\W');
      if (re.test(url)) {
        return false;
      }
    }

    return true;
  };

  var checkEnvTrello = function () {
    // https://trello.com/1/connect?key=...&name=NinjaDevsLinkCrawler&response_type=token&scope=read,write
    tempTrelloKey = process.env.HUBOT_LINK_CRAWLER_TRELLO_KEY;
    tempTrelloSecret = process.env.HUBOT_LINK_CRAWLER_TRELLO_SECRET;
    trelloList = process.env.HUBOT_LINK_CRAWLER_TRELLO_LIST;

    if (tempTrelloKey !== trelloKey || tempTrelloSecret !== tempTrelloSecret) {
      trelloKey = tempTrelloKey;
      trelloSecret = tempTrelloSecret;

      if (!trelloKey || !trelloSecret) {
        robot.logger.error('Can\'t create Trello cards, missing key or secret');
        return false;
      }

      trello = new Trello(trelloKey, trelloSecret);
    }

    return true;
  };

  var checkEnv = function () {
    blackList = (process.env.HUBOT_LINK_CRAWLER_BLACK_LIST || '').split(',');
    blackListExtensions = (process.env.HUBOT_LINK_CRAWLER_BLACK_LIST_EXTENSIONS || '').split(',');
    listenChannel = process.env.HUBOT_LINK_CRAWLER_LISTEN_CHANNEL || false;
    postToChannel = process.env.HUBOT_LINK_CRAWLER_POST_TO_CHANNEL || false;
  };

  robot.listen(function (msg) {
    // For debugging the channel id
    // robot.logger.info('Message from room', msg.room);
    checkEnv();

    if (listenChannel && msg.room !== listenChannel) {
      return;
    }

    var results = [];
    var re = /https?:\/\/\S+/ig;
    var tempResult = re.exec(msg.text);

    for (; tempResult; tempResult = re.exec(msg.text)) {
      if (isUrlAllowed(tempResult[0])) {
        results.push(tempResult[0]);
      }
    }

    if (results.length) {
      return results;
    }
  }, function (res) {
    if (!checkEnvTrello()) {
      return;
    }

    res.match.forEach(function (url) {
      SiteMeta.scrape(url, function (err, info) {
        if (err) {
          return res.send('Can\'t create Trello cards, missing key or secret');
        }

        var meta = info.meta.og ? info.meta.og :
          info.meta.twitter ? info.meta.twitter :
            info.meta;

        var image = meta.image;
        var url = meta.url || info.url;
        var name = meta.title || url;
        var description = meta.description || 'Missing';
        description += '\n\nURL: ' + url;

        trello.addCard(name, description, trelloList)
        .then(function (card) {
          if (image) {
            return trello.addAttachmentToCard(card.id, image)
            .then(function () {
              return card;
            });
          } else {
            return card;
          }
        })
        .then(function (card) {
          // res.send('Trello card created');
          robot.logger.info('Trello card created ' + card.id);
        });
      });
    });
  });
};
