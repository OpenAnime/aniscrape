
<div align="center">
  
# Aniscrape 🎭

  <a href="https://www.codefactor.io/repository/github/constani/aniscrape"><img alt="CodeFactor Grade" src="https://www.codefactor.io/repository/github/constani/aniscrape/badge"></a>
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Constani/aniscrape">

**Web scraping tool to download videos from TürkAnimeTV and AnimeciX**

</div>

# Installation and running
Just clone the repository and open a terminal in the repository folder then type `npm i` to install all the required modules. After that type `node test.js` to run the program.

# Note

`We highly suggest to provide a adblocker path while creating a web scraping session because some players redirect you to different links so this can broke your entire session completely. We recommend using uBlock Origin`

# Docs

`Creating a new scraping session and listen for responses`

```js
const { Scraper } = require("./src/Scraper")
let scraper = new Scraper({
 useAdBlocker: true,
 adBlockerPath: "C:\\Users\\Asus\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\cjpalhdlnbpafiamejdnhcphjbkeiagm\\1.43.0_3",
 browserPath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
 headless: false
})
scraper.scrape("https://www.turkanime.co/video/komi-san-wa-comyushou-desu-2nd-season-11-bolum")

scraper.on("gotURL", (data) => {
 console.log(data)
})
```

`Terminate current session`

```js
scraper.terminateSession()
```

`Terminate session and re-open it again`

```
test.js file has an example with that situation.
```

## Contributors ✨

<table>
  <tr>
        <td align="center"><a href="https://spongebed.me"><img src="https://avatars.githubusercontent.com/u/56435044?v=4" width="100px;" alt=""/><br /><sub>                     <b>SpongeBed</b></sub></a><br /> <a href="https://github.com/Constani/aniscrape/commits?author=SpongeBed81" title="Code">💻</a></td>
            <td align="center"><a href="https://spongebed.me"><img src="https://avatars.githubusercontent.com/u/93868975?v=4" width="100px;" alt=""/><br /><sub>                     <b>Kax675</b></sub></a><br /> <a href="https://github.com/Constani/aniscrape/commits?author=Kax675" title="Code">💻</a></td>
    </tr>
</table>
