const { Scraper } = require("./src/Scraper")
let scraper = new Scraper({
 useAdBlocker: true,
 adBlockerPath: "C:\\Users\\Asus\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\cjpalhdlnbpafiamejdnhcphjbkeiagm\\1.43.0_3",
 browserPath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
 headless: false
})
scraper.scrape("https://www.turkanime.co/video/haikyuu-ii-23-bolum")

function listen() {
 scraper.on("gotURL", (data) => {
  console.log(data)
  scraper.terminateSession()
  scraper = new Scraper({
   useAdBlocker: true,
   adBlockerPath: "C:\\Users\\Asus\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\cjpalhdlnbpafiamejdnhcphjbkeiagm\\1.43.0_3",
   browserPath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
   headless: false
  })
  setTimeout(() => {
   scraper.scrape("https://www.turkanime.co/video/haikyuu-ii-23-bolum")     
   listen()
  }, 2000);
 })
}
listen()