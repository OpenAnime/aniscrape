const playerButtonsHolder = `#videodetay > div > div:nth-child(4)`
const config = require("./playerConfig.json");
let EventEmitter = require('node:events').EventEmitter

const UniversalControllers = require("./Universal-Controllers");
module.exports = {
 Events: new EventEmitter(),
 ended: false,
 async searchVideo(browser, page) {
  this.Events = new EventEmitter() //re-init the event emitter for working with recursive functions
  this.ended = false;
  let currentFansub = 1
  let selector = `#videodetay > div > div.pull-right`
  let currentPlayers = []
  let index = 0
  let iframe;
  let playSelect;


  var getMP4 = (function() {
    return new Promise(async (resolve) => {
      if(playSelect !== undefined && playSelect !== null && iframe !== undefined) {
        if(iframe.startsWith("https://www.turkanime.co/player/")) {
        resolve("ok")
        } else {
          let newPage = await browser.newPage()
          await newPage.goto(iframe, {
           waitUntil: 'networkidle0'
          })
          await newPage.waitForSelector(playSelect)
          await newPage.setRequestInterception(true)
          UniversalControllers.trackRequests(newPage).then(async (req) => {
           if (typeof req === "string") {
            this.Events.emit("gotURL", req)
           }
           if (this.ended == true) return
           newPage.close() //close the current iframe tab  
           resolve("ok")
          })
          await newPage.evaluate((playSelect) => {
           document.querySelector(playSelect).click()
          }, playSelect)
        }
      } else {
        UniversalControllers.trackRequests(page).then(async(req) => {
          if(typeof req === "string") {
            this.Events.emit("gotURL", req)
            resolve("ok")
          }
        })
      }
    })
  }).bind(this)

  await page.exposeFunction("command", async(data) => {
    if(data.mode == "setPlayers") {
      currentPlayers = data.players
      currentFansub++
      let checkSupportedPlayers = currentPlayers.filter(x => config.players.some(y => y.name == x))
      if(checkSupportedPlayers !== undefined && checkSupportedPlayers.length > 0) {
        async function fivesecrec() {
          if(index == checkSupportedPlayers.length) {
            index = 0
            clickCurrentFansub()
            return;
          }
          let currentPlayer = checkSupportedPlayers[index]
          let getNumber = currentPlayers.indexOf(currentPlayer)+1
          let find2 =  config.players.find(x => x.name == currentPlayer)
          if(Object.keys(find2).includes("selector")) {
            playSelect = find2.selector
          }
          await page.evaluate((getNumber) => {
            document.querySelector(`#videodetay > div > div:nth-child(4) > button:nth-child(${getNumber})`).click()
            setTimeout(() => {
              window.command({
                "mode": "setframe",
                "frame": document.querySelector("#videodetay > div > div.video-icerik > iframe").contentWindow.document.querySelector("#iframe-container > iframe").src
              })
            }, 2000);
          }, getNumber)
          setTimeout(() => {
            getMP4().then(() => {
              index++
              fivesecrec()
            })
          }, 3000);
        }
        fivesecrec()
      } else {
        index = 0
        currentPlayers = []
        clickCurrentFansub()
      }
    } else if(data.mode == "setframe") {
      iframe = data.frame
    }
  })
 

  async function clickCurrentFansub() {
    await page.waitForSelector(selector).then(async() => {
      try{
        await page.evaluate((selector, currentFansub) => {
          document.querySelector(selector + ` > button:nth-child(${currentFansub})`).click()
        }, selector, currentFansub)
      } catch(e) {
        //means there is no fansub to navigate to so we should stop the search process 
        this.ended = true;
      }
      setTimeout(async() => {
        selector = `#videodetay > div > div.btn-group.pull-right`
        await page.waitForSelector("#videodetay > div > div:nth-child(4)").then(async() => {
          await page.evaluate(() => {
            let els = []
            document.querySelector("#videodetay > div > div:nth-child(4)").childNodes.forEach(el => {
              els.push(el.innerText.trim().toLowerCase())
            })
            window.command({
              "mode": "setPlayers",
              "players": els
            })
          })
        })
      }, 2000)
    })   
  }
  clickCurrentFansub()
 }
}