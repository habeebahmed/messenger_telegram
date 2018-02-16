const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('9973512c1f434c67b1a47b7d2fcc47eb');
var news = require('./index_t.js')
function news_api(cate,msg){
newsapi.v2.topHeadlines({
  //sources: 'bbc-news',
  //  q: '',
  category: cate,
  language: 'en',
  country: 'in'
}).then(response => {

  //console.log('Hello');
  //console.log(response);
  //console.log(response);
  news.news_api2(response,msg)

})
//return 'Hello'
}

//news_api('technology')

module.exports.news_api = news_api
/*
if (msg.text.toString() === 'hello' ) {
  console.log('1');
bot.sendMessage(msg.chat.id, "http://www.ibtimes.co.in/lg-v30s-256gb-rom-coming-ahead-flagship-lg-g7-what-we-know-so-far-760072");
 // bot.sendPhoto(msg.chat.id, 'https://www.gettyimages.com/gi-resources/images/frontdoor/creative/LonelyPlanetRM/Slide_2.jpg');
}
if(msg.text.toString() === 'Technology' || 'technology') {
 console.log('2');
bot.sendMessage(msg.chat.id, 'Ok , we will get you the latest news');
}else if(msg.text.toString() === 'Science' || 'science'){
 console.log('3');
bot.sendMessage(msg.chat.id, 'Ok , we will get you the latest news');
}else if(msg.text.toString() === 'Entertainment'|| 'entertainment'){
 console.log('4');
bot.sendMessage(msg.chat.id, 'Ok , we will get you the latest news');
}else if (msg.text.toString() === 'Sports'||'sports') {
 console.log('5');
bot.sendMessage(msg.chat.id, 'Ok , we will get you the latest news');
}
else {
 console.log('6');
 bot.sendMessage(msg.chat.id, msg.chat.text);
}
*/
