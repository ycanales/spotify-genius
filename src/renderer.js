// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const cheerio = require('cheerio')
const shell = require('shelljs')
const genius = require('../secret').genius

let currentSong = shell.exec('osascript spotify.applescript', {async: true})

currentSong.stdout.on('data', song => {
  let geniusHeaders = new Headers()
  geniusHeaders.append('Authorization', `Bearer ${genius.accessToken}`)

  document.querySelector('.song-name').innerHTML = song
  song = song.replace('Live', '')

  fetch(`http://api.genius.com/search?q=${song}`, {
    method: 'GET',
    headers: geniusHeaders
  })
    .then(function(response) {
      return response.json()
    })
    .then(function(json) {
      return fetch(json.response.hits[0].result.url)
    })
    .then(function(response) {
      return response.text()
    })
    .then(function(text) {
      let $ = cheerio.load(text)
      let lyrics = $('.lyrics').text().trim().replace(/googletag\.cmd\.push\(.*}\);/g, '')
      document.getElementById('lyrics').innerHTML = lyrics
    })
})
