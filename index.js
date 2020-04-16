require('newrelic');
require('dotenv').config();
const express = require('express')
const expressApp = express()

const port = process.env.PORT || 3000
expressApp.get('/', (req, res) => {
  res.send('Please visit http://t.me/holoidbot to access this bot')
})
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
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
// Hololive ID: 1204978594490961920
const holoIdMember = [1234753886520393729, 1234752200145899520, 1235180878449397764]
// const holoIdMember = [172803635]; // development testing using my own twitter ID
const tweetID = '1234753886520393729,1234752200145899520,1235180878449397764,1204978594490961920';
// const tweetID = '172803635'; // development testing using my own twitter ID
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
  try {
    let arr = localStorage.getItem('subsList') ? JSON.parse(localStorage.getItem('subsList')) : [];
      console.log(ctx.message);
      const idxID = arr.indexOf(ctx.message.chat.id);
      if (idxID === -1) {
        arr.push(ctx.message.chat.id);
        localStorage.setItem('subsList', JSON.stringify(arr));
        ctx.reply('Added to subscription');
      } else {
        ctx.reply('Already subscribed');
      }
  } catch(err) {
    ctx.reply('Something happened, cannot subscribe');
  }
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

console.log('Waiting for tweets');

stream.on('tweet', function (tweet) {
  console.log(tweet);
  let message = '';
  let arr = localStorage.getItem('subsList') ? JSON.parse(localStorage.getItem('subsList')) : [];
  const thisTweet = holoIdMember.indexOf(tweet.user.id);
  if (thisTweet > -1) {
    switch (true) {
      case tweet.retweeted_status: {
        message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> retweeted:
      \n${tweet.retweeted_status.user.screen_name} tweeted:
      ${tweet.retweeted_status.text}`;
        break;
      }
      case tweet.quoted_status: {
        message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> tweeted:
      \n${tweet.text}

      quoted tweet:
      >${tweet.quoted_status.user.screen_name} tweeted:
      ${tweet.quoted_status.text}`;
        break;
      }
      case tweet.extended_tweet: {
        message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> tweeted:
      \n${tweet.extended_tweet.full_text}`;
        break;
      }
      case tweet.text: {
        message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> tweeted:
      \n${tweet.text}`;
      }
      default:
    }

    if (tweet.extended_tweet) {
      message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> tweeted:
    \n${tweet.extended_tweet.full_text}`;
    } else {
      message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> tweeted:
    \n${tweet.text}`
    }

    if (tweet.retweeted_status) {
      message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> retweeted:
      \n>>${tweet.retweeted_status.user.screen_name}\n\n${tweet.retweeted_status.text}`;
    }

    if (tweet.quoted_status) {
      message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> tweeted:
      \n${tweet.text}\n\nquoted tweet:\n>>${tweet.quoted_status.user.screen_name}\n\n${tweet.quoted_status.text}`;
    }

    if (tweet.in_reply_to_status_id_str) {
      message = `><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">${tweet.user.screen_name}</a> replying tweet:
      \n${tweet.text}\n\nto this <a href="https://twitter.com/i/status/${tweet.in_reply_to_status_id_str}">tweet</a>`
    }
    arr.forEach(recipientID => {
      bot.telegram.sendMessage(recipientID, message, { parse_mode: 'HTML' })
    })
  }
  // bot.telegram.sendMessage(-457078482 ,`Tweet from ${tweet.user.screen_name}\n\n${tweet.text}`)
});

console.log('the bot are running...')

bot.launch();