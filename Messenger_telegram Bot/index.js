var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('9973512c1f434c67b1a47b7d2fcc47eb');
var news = [];
var token = "EAAElgNzc6VwBAAONBnKebvTYvmUybehh0OZCVAIY7yKZC6yxo2AEOk5T8uzEeghtQRMxx7tEXdHfWvR6fkigYZBZAhiiu7lrxscMQxkcX8zk7IIvj8ip9hZBNSKjHU2nep3p0Ln4aQaesXOSUBbJVEqiCU9OFRhc7kMEW8D5XQAZDZD"
var title = [];
var url = [];
var url_image = [];
var index_t = require('./index_t')
app.set('port', (process.env.PORT || 8080))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function(req, res) {
  res.send('bot is on')
})

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === 'password') {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('Error, wrong token')
  }
})

app.post('/webhook', function(req, res) {
  var data = req.body;

  addPersistentMenu()

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {

        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }


      });
    });

    res.sendStatus(200);
  }
});


function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s",
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
      case 'hello':
      case 'hi':
        sendHiMessage(senderID);
        break;

      case 'news':
        sendButtonMessage(senderID);
        break;

      case 'more news':
        sendButtonMessage2(senderID)
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  //  var payload = event.postback.payload;

  if (event.postback.payload === 'PAYLOAD:get_started') {
    sendHiMessage(senderID)
  }
  if (event.postback.payload === 'PAYLOAD:tech_news') {
    news_tech(senderID)
  }
  if (event.postback.payload === 'PAYLOAD:sport_news') {
    news_sport(senderID)
  }
  if (event.postback.payload === 'PAYLOAD:enter_news') {
    news_enter(senderID)
  }
  if (event.postback.payload === 'PAYLOAD:gen_news') {
    news_gen(senderID)
  }
  if (event.postback.payload === 'PAYLOAD:bus_news') {
    news_bus(senderID)
  }
  if (event.postback.payload === 'PAYLOAD:science_news') {
    news_science(senderID)
  }


}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}


function news_tech(recipientId) {

  newsapi.v2.topHeadlines({
    //sources: 'bbc-news',
    //  q: '',
    category: 'technology',
    language: 'en',
    country: 'in'
  }).then(response => {

    //console.log(response);
    for (i = 0; i < 5; i++) {
      title[i] = response.articles[i].title;
      url[i] = response.articles[i].url;
      url_image[i] = response.articles[i].urlToImage;
    }
    console.log(title);
    console.log(url);
    console.log(url_image);

    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: title[0],
                subtitle: title[0],
                item_url: url[0],
                image_url: url_image[0],
                buttons: [{
                  type: "web_url",
                  url: url[0],
                  title: "Go to web"
                }],
              }, {
                title: title[1],
                subtitle: title[1],
                item_url: url[1],
                image_url: url_image[1],
                buttons: [{
                  type: "web_url",
                  url: url[1],
                  title: "Go to web"
                }]
              }, {
                title: title[2],
                subtitle: title[2],
                item_url: url[2],
                image_url: url_image[2],
                buttons: [{
                  type: "web_url",
                  url: url[2],
                  title: "Go to web"
                }]
              },
              {
                title: title[3],
                subtitle: title[3],
                item_url: url[3],
                image_url: url_image[3],
                buttons: [{
                  type: "web_url",
                  url: url[3],
                  title: "Go to web"
                }]
              }
            ]

          }
        }
      }
    };

    callSendAPI(messageData);


  });
}


function news_sport(recipientId) {

  newsapi.v2.topHeadlines({
    //sources: 'bbc-news',
    //  q: '',
    category: 'sports',
    language: 'en',
    country: 'in'
  }).then(response => {

    //console.log(response);
    for (i = 0; i < 5; i++) {
      title[i] = response.articles[i].title;
      url[i] = response.articles[i].url;
      url_image[i] = response.articles[i].urlToImage;
    }
    console.log(title);
    console.log(url);
    console.log(url_image);

    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: title[0],
                subtitle: title[0],
                item_url: url[0],
                image_url: url_image[0],
                buttons: [{
                  type: "web_url",
                  url: url[0],
                  title: "Go to web"
                }],
              }, {
                title: title[1],
                subtitle: title[1],
                item_url: url[1],
                image_url: url_image[1],
                buttons: [{
                  type: "web_url",
                  url: url[1],
                  title: "Go to web"
                }]
              }, {
                title: title[2],
                subtitle: title[2],
                item_url: url[2],
                image_url: url_image[2],
                buttons: [{
                  type: "web_url",
                  url: url[2],
                  title: "Go to web"
                }]
              },
              {
                title: title[3],
                subtitle: title[3],
                item_url: url[3],
                image_url: url_image[3],
                buttons: [{
                  type: "web_url",
                  url: url[3],
                  title: "Go to web"
                }]
              }
            ]

          }
        }
      }
    };

    callSendAPI(messageData);


  });
}

function news_enter(recipientId) {

  newsapi.v2.topHeadlines({
    //sources: 'bbc-news',
    //  q: '',
    category: 'entertainment',
    language: 'en',
    country: 'in'
  }).then(response => {

    //console.log(response);
    for (i = 0; i < 5; i++) {
      title[i] = response.articles[i].title;
      url[i] = response.articles[i].url;
      url_image[i] = response.articles[i].urlToImage;
    }
    console.log(title);
    console.log(url);
    console.log(url_image);

    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: title[0],
                subtitle: title[0],
                item_url: url[0],
                image_url: url_image[0],
                buttons: [{
                  type: "web_url",
                  url: url[0],
                  title: "Go to web"
                }],
              }, {
                title: title[1],
                subtitle: title[1],
                item_url: url[1],
                image_url: url_image[1],
                buttons: [{
                  type: "web_url",
                  url: url[1],
                  title: "Go to web"
                }]
              }, {
                title: title[2],
                subtitle: title[2],
                item_url: url[2],
                image_url: url_image[2],
                buttons: [{
                  type: "web_url",
                  url: url[2],
                  title: "Go to web"
                }]
              },
              {
                title: title[3],
                subtitle: title[3],
                item_url: url[3],
                image_url: url_image[3],
                buttons: [{
                  type: "web_url",
                  url: url[3],
                  title: "Go to web"
                }]
              }
            ]

          }
        }
      }
    };

    callSendAPI(messageData);


  });
}

function news_gen(recipientId) {

  newsapi.v2.topHeadlines({
    //sources: 'bbc-news',
    //  q: '',
    category: 'general',
    language: 'en',
    country: 'in'
  }).then(response => {

    //console.log(response);
    for (i = 0; i < 5; i++) {
      title[i] = response.articles[i].title;
      url[i] = response.articles[i].url;
      url_image[i] = response.articles[i].urlToImage;
    }
    console.log(title);
    console.log(url);
    console.log(url_image);

    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: title[0],
                subtitle: title[0],
                item_url: url[0],
                image_url: url_image[0],
                buttons: [{
                  type: "web_url",
                  url: url[0],
                  title: "Go to web"
                }],
              }, {
                title: title[1],
                subtitle: title[1],
                item_url: url[1],
                image_url: url_image[1],
                buttons: [{
                  type: "web_url",
                  url: url[1],
                  title: "Go to web"
                }]
              }, {
                title: title[2],
                subtitle: title[2],
                item_url: url[2],
                image_url: url_image[2],
                buttons: [{
                  type: "web_url",
                  url: url[2],
                  title: "Go to web"
                }]
              },
              {
                title: title[3],
                subtitle: title[3],
                item_url: url[3],
                image_url: url_image[3],
                buttons: [{
                  type: "web_url",
                  url: url[3],
                  title: "Go to web"
                }]
              }
            ]

          }
        }
      }
    };

    callSendAPI(messageData);


  });
}

function news_bus(recipientId) {

  newsapi.v2.topHeadlines({
    //sources: 'bbc-news',
    //  q: '',
    category: 'business',
    language: 'en',
    country: 'in'
  }).then(response => {

    //console.log(response);
    for (i = 0; i < 5; i++) {
      title[i] = response.articles[i].title;
      url[i] = response.articles[i].url;
      url_image[i] = response.articles[i].urlToImage;
    }
    console.log(title);
    console.log(url);
    console.log(url_image);

    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: title[0],
                subtitle: title[0],
                item_url: url[0],
                image_url: url_image[0],
                buttons: [{
                  type: "web_url",
                  url: url[0],
                  title: "Go to web"
                }],
              }, {
                title: title[1],
                subtitle: title[1],
                item_url: url[1],
                image_url: url_image[1],
                buttons: [{
                  type: "web_url",
                  url: url[1],
                  title: "Go to web"
                }]
              }, {
                title: title[2],
                subtitle: title[2],
                item_url: url[2],
                image_url: url_image[2],
                buttons: [{
                  type: "web_url",
                  url: url[2],
                  title: "Go to web"
                }]
              },
              {
                title: title[3],
                subtitle: title[3],
                item_url: url[3],
                image_url: url_image[3],
                buttons: [{
                  type: "web_url",
                  url: url[3],
                  title: "Go to web"
                }]
              }
            ]

          }
        }
      }
    };

    callSendAPI(messageData);


  });
}



function news_science(recipientId) {

  newsapi.v2.topHeadlines({
    //sources: 'bbc-news',
    //  q: '',
    category: 'science',
    language: 'en',
    country: 'in'
  }).then(response => {

    //console.log(response);
    for (i = 0; i < 5; i++) {
      title[i] = response.articles[i].title;
      url[i] = response.articles[i].url;
      url_image[i] = response.articles[i].urlToImage;
    }
    console.log(title);
    console.log(url);
    console.log(url_image);

    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: title[0],
                subtitle: title[0],
                item_url: url[0],
                image_url: url_image[0],
                buttons: [{
                  type: "web_url",
                  url: url[0],
                  title: "Go to web"
                }],
              }, {
                title: title[1],
                subtitle: title[1],
                item_url: url[1],
                image_url: url_image[1],
                buttons: [{
                  type: "web_url",
                  url: url[1],
                  title: "Go to web"
                }]
              }, {
                title: title[2],
                subtitle: title[2],
                item_url: url[2],
                image_url: url_image[2],
                buttons: [{
                  type: "web_url",
                  url: url[2],
                  title: "Go to web"
                }]
              },
              {
                title: title[3],
                subtitle: title[3],
                item_url: url[3],
                image_url: url_image[3],
                buttons: [{
                  type: "web_url",
                  url: url[3],
                  title: "Go to web"
                }]
              }
            ]

          }
        }
      }
    };

    callSendAPI(messageData);


  });
}


function sendHiMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      "attachment": {
        "type": "image",
        "payload": {
          "url": "https://media2.giphy.com/media/l3q2GDh3wQqVWSiGY/giphy.gif",
          "is_reusable": true
        }
      }
    }
  }
  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {

      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Trending news Type 'more news' for more category",
          "buttons": [{
              "type": "postback",
              "title": "tech news",
              "payload": "PAYLOAD:tech_news"
            }, {
              "type": "postback",
              "title": "sports news",
              "payload": "PAYLOAD:sport_news"
            },
            {
              "type": "postback",
              "title": "entertainment news",
              "payload": "PAYLOAD:enter_news"

            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendButtonMessage2(recipientId) {

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {

      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Here you go",
          "buttons": [{
              "type": "postback",
              "title": "general news",
              "payload": "PAYLOAD:gen_news"

            },
            {
              "type": "postback",
              "title": "business news",
              "payload": "PAYLOAD:bus_news"

            },
            {
              "type": "postback",
              "title": "science news",
              "payload": "PAYLOAD:science_news"

            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);

}

function addPersistentMenu(){
 request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: token},
    method: 'POST',
    json:{
  "get_started":{
    "payload":"PAYLOAD:get_started"
   }
 }
}, function(error, response, body) {
    console.log("Add persistent menu " + response)
    if (error) {
        console.log('Error sending messages: ', error)
    } else if (response.body.error) {
        console.log('Error: ', response.body.error)
    }
})
 request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: token },
    method: 'POST',
    json:{
"persistent_menu":[
    {
      "locale":"default",
      "composer_input_disabled":false,
      "call_to_actions":[
        {
          "title":"About",
          "type":"postback",
          "payload":"PAYLOAD:get_started"
        },
        {
          "title":"Trending News",
          "type":"nested",
          "call_to_actions":[
            {
              "title":"Tech News",
              "type":"postback",
              "payload":"PAYLOAD:tech_news"
            },
            {
              "title":"Entertainment News",
              "type":"postback",
              "payload":"PAYLOAD:enter_news"
            },
            {
              "title":"Sports News",
              "type":"postback",
              "payload":"PAYLOAD:sport_news"
            }
          ]
        },
        {
          "title":"Other News",
          "type":"nested",
          "call_to_actions":[
            {
              "title":"Science News",
              "type":"postback",
              "payload":"PAYLOAD:science_news"
            },
            {
              "title":"General News",
              "type":"postback",
              "payload":"PAYLOAD:gen_news"
            },
            {
              "title":"Business News",
              "type":"postback",
              "payload":"PAYLOAD:bus_news"
            }
          ]
        }
      ]
    },
    {
      "locale":"zh_CN",
      "composer_input_disabled":false
    }
    ]
    }

}, function(error, response, body) {
    console.log(response)
    if (error) {
        console.log('Error sending messages: ', error)
    } else if (response.body.error) {
        console.log('Error: ', response.body.error)
    }
}
)
}


function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: token
    },
    method: 'POST',
    json: messageData

  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
        console.log("Successfully called Send API for recipient %s",
          recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}







app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
