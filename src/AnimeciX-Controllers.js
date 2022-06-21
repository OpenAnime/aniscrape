const config = require("./playerConfig.json");
let EventEmitter = require('node:events').EventEmitter
const UniversalControllers = require("./Universal-Controllers");
module.exports = {
 Events: new EventEmitter(),
 ended: false,
 async searchVideo(browser, page) {
  this.Events = new EventEmitter()
  this.ended = false;
  let currentPlayer;
  let currentButton = 1;
  let navigated = false;
  await page.exposeFunction('command', async (data) => {
   if (data.mode == "increase") {
    currentButton++
   } else if (data.mode == "currentPlayer") {
    currentPlayer = data.player
   } else if (data.mode == "busy") {
    navigated = data.isBusy;
   } else if (data.mode == "iframe") {
    let newPage = await browser.newPage()
    await newPage.goto(data.url, {
     waitUntil: 'networkidle0'
    })
    navigated = true;
    await newPage.waitForSelector(data.selector)
    await newPage.setRequestInterception(true)
    UniversalControllers.trackRequests(newPage).then(async (req) => {
     if (typeof req === "string") {
      this.Events.emit("gotURL", req)
     }
     if (this.ended == true) return
     newPage.close() //close the current iframe tab
     setTimeout(async () => {
      await page.evaluate(() => {
       document.querySelector("body > div.cdk-overlay-container > div > div > player > div > div").childNodes[1].click() //close the iframe page or smth like that idk
      })
      navigated = false
     }, 2000);

    })
    await newPage.evaluate((data) => {
     document.querySelector(data.selector).click()
    }, data)
   } else if (data.mode == "end") {
    this.ended = true;
   } else if (data.mode == "direct") {
    this.Events.emit("gotURL", data.url)
    navigated = false
   }
  })


  var intv = setInterval(async () => {
   if (navigated == true) return
   if (this.ended == true) {
    clearInterval(intv)
    return;
   }
   await page.evaluate((currentButton) => {
    if (currentButton > document.querySelector("body > app-root > title-page-container > div > title-videos > title-video-table > table > tbody").childNodes.length - 1) {
     window.command({
      "mode": "end"
     })
     return
    }
    let name = document.querySelector(`body > app-root > title-page-container > div > title-videos > title-video-table > table > tbody > tr:nth-child(${currentButton}) > td.name-column`).childNodes[0].childNodes[1].innerHTML.toLowerCase()
    document.querySelector(`body > app-root > title-page-container > div > title-videos > title-video-table > table > tbody > tr:nth-child(${currentButton}) > td.name-column`).click()
    window.command({
     "mode": "increase"
    })
    window.command({
     "mode": "currentPlayer",
     "player": name
    })
    window.command({
     "mode": "busy",
     "isBusy": true
    })
   }, currentButton)
   if (this.ended == true) return
   await page.waitForSelector("body > div.cdk-overlay-container > div > div > player > mat-sidenav-container > mat-sidenav-content > div.player-top.container > div.iframe-container.embed-container.ng-star-inserted").then(async () => {
    setTimeout(async () => {
     await page.evaluate((config, currentPlayer) => {
      let iframeURL = document.querySelector("body > div.cdk-overlay-container > div > div > player > mat-sidenav-container > mat-sidenav-content > div.player-top.container > div.iframe-container.embed-container.ng-star-inserted").childNodes[0].src
      let find = config.players.find(x => x.name == currentPlayer)
      if (find !== undefined) { //if player is supported
       if (find.isRedirectingRequired == true) {
        window.command({
         "url": iframeURL,
         "selector": find.selector,
         "mode": "iframe"
        })
       } else if (find.isParsingRequired == true) {
        const getID = iframeURL.replace("https://drive.google.com/file/d/", "").replace("/preview", "")
        window.command({
         "mode": "direct",
         "url": `https://drive.google.com/uc?export=download&id=${getID}&confirm=t`
        })
       }

      } else { //if player is not supported
       window.command({
        "mode": "busy",
        "isBusy": false
       })
       document.querySelector("body > div.cdk-overlay-container > div > div > player > div > div").childNodes[1].click() //close the iframe page or smth like that idk
      }
     }, config, currentPlayer)
    }, 3000);
   })
  }, 5000)
 }
}