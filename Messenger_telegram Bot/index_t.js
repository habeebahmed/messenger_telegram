process.env["NTBA_FIX_319"] = 1;
var TelegramBot = require('node-telegram-bot-api');
//url = "https://static.pexels.com/photos/248797/pexels-photo-248797.jpeg"
var token = "549599975:AAFW05c-idVTxaoXXK9yzQMMyXMHY7fK7Hw";
const bot = new TelegramBot(token, {
  polling: true
});

var news = require('./demo2.js')

/*bot.on("text", (message) => {
  bot.sendMessage(message.chat.id, "Hello world");
});*/
function news_api2(cate,msg) {
console.log('in function');
//console.log(cate);
for (i=0;i<5;i++){

bot.sendMessage(msg.chat.id,cate.articles[i].url)

}


}
bot.onText(/\/start/, (msg) => {

bot.sendMessage(msg.chat.id, "Welcome");

});

bot.onText(/\/help/, (msg) =>{
  bot.sendMessage(msg.chat.id, "type or use below keyboard for Trending News");
});
bot.on('message', (msg) => {
  console.log(msg);
 switch (msg.text.toString()) {
   case 'hi':
   case 'hello':
   case 'Hello':
   case 'Hi':
   bot.sendVideo(msg.chat.id, "https://media2.giphy.com/media/l3q2GDh3wQqVWSiGY/giphy.gif");

      break;
   case 'Technology':
   case 'technology':
   bot.sendMessage(msg.chat.id, 'Ok , we will get you the latest news');
   news.news_api('technology',msg)

   break;

   case 'Science':
   case 'science':
   bot.sendMessage(msg.chat.id, 'Ok , we will get you the latest news');
   news.news_api('science',msg)
     break;

   case 'Entertainment':
   case 'entertainment':

   bot.sendMessage(msg.chat.id, 'Ok , we will get you the latest news');
   news.news_api('entertainment',msg)
     break;

   case 'Sports':
   case 'sports':

    bot.sendMessage(msg.chat.id, 'Ok , we will get you the latest news');
    news.news_api('sports',msg)
     break;

   case '/start':
   case '/help':

    break;

   default:
   //console.log(msg.text)
   bot.sendMessage(msg.chat.id, msg.text);
   break;

 }

keyboard(msg),1000
})

function keyboard(msg) {

  bot.sendMessage(msg.chat.id,'',
  {
    reply_markup: {
      keyboard: [["Technology","Science"],["Entertainment","Sports"]]
     }

    }
  )
}


module.exports.news_api2 = news_api2
