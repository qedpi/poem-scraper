// Imports
const express = require('express');
const socket = require('socket.io');

// App setup
const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
   console.log('listening to,', port)
});

// Static files
app.use(express.static('public'));

// Sockets
const io = socket(server);

// Poem data
const rp = require('request-promise');
const cheerio = require('cheerio');

const options = {
    url: `https://www.poets.org/poetsorg/poem-day/`,
    transform: body => cheerio.load(body),
};
const options2 = {
    url: `http://poems.com/`,
    transform: body => cheerio.load(body),
};

let last_retrieval_time = 0;
const poems = [{}, {}];

io.on('connection', socket => {
    console.log('connected to ', socket.id);
    const cur = new Date();
    if (!last_retrieval_time || cur - last_retrieval_time > 3600 * 1000){ // update poems if necessary
        console.log('scraping poems!');
        last_retrieval_time = cur;
        // poem.timestamp = cur;
        rp(options).then($ => {
            poems[0].title = $('#poem-content h1').html();
            poems[0].content = $('pre').html();
            // emit after each poem in case one fails
            socket.emit('poem', poems);
        }).error(e => console.log(e));
        rp(options2).then($ => {
            //const loc = $()
            const dateNum = $('strong a').attr('href');

            rp({url: options2.url + dateNum, transform: options2.transform}).then($ => {
                poems[1].title = $('#page_title').html();
                poems[1].content = $('#poem').html();
                socket.emit('poem', poems);
            }).error(e => console.log(e));
        }).error(e => console.log(e));
    }
});