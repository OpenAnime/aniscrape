const playerButtonsHolder = `#videodetay > div > div:nth-child(4)`
let navigated = false;
const config = require("./playerConfig.json");
let EventEmitter = require('node:events').EventEmitter
let mainEvent = new EventEmitter()

const UniversalControllers = require("./Universal-Controllers");
module.exports = {
 Events: mainEvent,
 async searchVideo(browser, page) {
  await page.exposeFunction('caught', async (data) => {
   if (data.mode !== "direct") { //if it is an iframe
    let newPage = await browser.newPage()
    await newPage.goto(data.url, {
     waitUntil: 'networkidle0'
    })
    navigated = true;
    await newPage.waitForSelector(data.selector)
    await newPage.setRequestInterception(true)
    UniversalControllers.trackRequests(newPage).then(req => {
     if (typeof req === "string") {
      mainEvent.emit("gotURL", req)
     }
     newPage.close() //close the current iframe page
     navigated = false
    })
    await newPage.evaluate((data) => {
     document.querySelector(data.selector).click()
    }, data)
   } else { //otherwise it is a direct url of the mp4 file
    if (typeof req === "string") {
     mainEvent.emit("gotURL", req)
    }
   }
  });

  await page.evaluate((playerButtonsHolder, navigated, config) => {
   let currentButton = 1
   setInterval(async () => {
    if (currentButton > document.querySelector(playerButtonsHolder).childNodes.length) return
    if (navigated == true) return
    const button = document.querySelector(playerButtonsHolder + ` > button:nth-child(${currentButton})`)
    button.click()
    let find = config.players.find(x => button.innerHTML.toLowerCase().includes(x.name))
    if (find !== undefined) {
     if (find.isRedirectingRequired == true) {
      setTimeout(() => {
       let iframeURL = document.querySelector(".video-icerik > iframe").contentWindow.document.querySelector("#iframe-container").childNodes[0].src
       window.caught({
        "url": iframeURL,
        "selector": find.selector,
        "mode": "iframe"
       })
      }, 3000);
     } else if (find.isParsingRequired == false) { //means all of the iframes has the same domain
      //prob just hdvid uses that
      setTimeout(() => {
       let directURL = document.querySelector(".video-icerik > iframe").contentWindow.document.querySelector("#iframe-container").childNodes[0].contentWindow.document.querySelector("#player > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video")
       window.caught({
        "url": directURL,
        "mode": "direct"
       })
      }, 3000);
     }
    }
    currentButton++
   }, 10000);
  }, playerButtonsHolder, navigated, config)
 }
}