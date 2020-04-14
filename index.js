require('dotenv').config();
const Telegraf = require('telegraf');
const RedisSession = require('telegraf-session-redis');
const LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');
const Twit = require('twit');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET,
  timeout_ms: 60*1000,
})
// Moona: 1234753886520393729
// Risu: 1234752200145899520
// Iofi: 1235180878449397764
const holoIdMember = [1234753886520393729, 1234752200145899520, 1235180878449397764]
const tweetID = '1234753886520393729,1234752200145899520,1235180878449397764'
const devTweetID = '172803635';
const stream = T.stream('statuses/filter', {
  follow: tweetID,
})

bot.start((ctx) => {
  ctx.reply(`Hi! This is unofficial Hololive ID bot.

  This bot will send tweet update from Hololive ID member (Ayunda Risu, Moona Hoshinova, Airani Iofifteen)

  There are two commands available for now
  /subscribe
  /unsubscribe`);
});
bot.help((ctx) => {
  ctx.reply('This section is still under construction.');
});
bot.settings((ctx) => {
  ctx.reply('This section is still under construction.');
});

bot.command('echo', ctx => {
  let input = ctx.message.text;
  console.log(ctx.message);
  let inputArray = input.split(' ');
  let message = '';

  if (inputArray.length === 1) {
    message = 'You said echo';
  } else {
    inputArray.shift();
    message = inputArray.join(' ');
  }

  ctx.reply(message);
})

bot.command('subscribe', ctx => {
  let arr = localStorage.getItem('subsList') ? JSON.parse(localStorage.getItem('subsList')) : [];
  console.log(ctx.message);
  arr.push(ctx.message.chat.id);
  localStorage.setItem('subsList', JSON.stringify(arr));
  ctx.reply('Added to subscription');
})

bot.command('unsubscribe', ctx => {
  let arr = localStorage.getItem('subsList') ? JSON.parse(localStorage.getItem('subsList')) : [];
  const removedIdx = arr.indexOf(ctx.message.chat.id);
  if (removedIdx > -1) {
    arr.splice(removedIdx, 1);
  }
  localStorage.setItem('subsList', JSON.stringify(arr));
  ctx.reply('Succesfully unsubscribe');
})

bot.command('show', ctx => {
  let arr = localStorage.getItem('subsList') ? JSON.parse(localStorage.getItem('subsList')) : [];
  let stringArr = arr.join(' ');
  ctx.reply('Subscription list' + stringArr)
})


console.log('Waiting for tweets');

stream.on('tweet', function (tweet) {
  console.log(tweet);
  let arr = localStorage.getItem('subsList') ? JSON.parse(localStorage.getItem('subsList')) : [];
  const thisTweet = holoIdMember.indexOf(tweet.user.id);
  if (thisTweet > -1 ) {
    arr.forEach(recipientID => {
      bot.telegram.sendMessage(recipientID, `Tweet from @${tweet.user.screen_name}

      ===
      ${tweet.text}
      ===`)
    });
  }
});

bot.launch();