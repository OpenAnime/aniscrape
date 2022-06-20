const absoluteURLs = ["animecix.net", "www.turkanime.co"]
const puppeteer = require("puppeteer-core")
const universalControllers = require("./Universal-Controllers")
const turkanimetv = require("./TurkAnimeTV-Controllers")
let EventEmitter = require('node:events').EventEmitter

class Scraper extends EventEmitter {
  /**
   * Applies the specified options.
   * @param {Object} options - The options object.
   * @param {string} options.browserPath - The executable file of the browser.
   * @param {boolean} [options.useAdBlocker] - Specifies the ad blocker should be used or not.
   * @param {string} options.adBlockerPath - The path of the ad blocker extension.
   * @param {boolean} [options.headless] - Specifies the browser should be headless or not.
   */
  constructor(options) {
    super(options)
    if (!options) {
      this.adBlockerEnabled = false
    } else {
      const keys = Object.keys(options)
      if (keys.includes("browserPath") && options["browserPath"] !== null && options["browserPath"] !== undefined && options["browserPath"].trim().length !== 0) {
        this.browserPath = options["browserPath"]
        if(keys.includes("headless")) {
          if(options["headless"] == true) {
            this.headless = true
          } else {
            this.headless = false
          }
        } else {
          this.headless = false
        }
        if (keys.includes("useAdBlocker") && options["useAdBlocker"] == true) {
          this.adBlockerEnabled = true
          if (keys.includes("adBlockerPath") && options["adBlockerPath"] !== null && options["adBlockerPath"] !== undefined && options["adBlockerPath"].trim().length !== 0) {
            this.AdBlockerPath = options["adBlockerPath"]
          } else {
            throw new Error("AdBlocker path should be provided when `useAdBlocker` option is true")
          }
        } else {
          this.adBlockerEnabled = false
        }
      } else {
        throw new Error("Path of the browser executable should be provided")
      }
    }
  }

  /**
   * Creates a new scraping session.
   * @param {String} url - The anime URL that you want to scrape video URL's from.
   */
  async scrape(url) {
    if (!url) throw new Error("URL Should be provided!")
    const cls = url.replace("https://", "").replace("http://", "")
    if (absoluteURLs.some(x => cls.startsWith(x))) {
      if (this.adBlockerEnabled == true) {
        this.browser = await puppeteer.launch({
          executablePath: this.browserPath,
          headless: this.headless,
          args: [
            `--disable-extensions-except=${this.AdBlockerPath}`,
            `--load-extension=${this.AdBlockerPath}`
          ]
        });
      } else {
        this.browser = await puppeteer.launch({
          executablePath: this.browserPath,
          headless: false
        });
      }
      setTimeout(async () => {
        let page = await this.browser.newPage()
        await page.evaluateOnNewDocument(() => {
          delete navigator.__proto__.webdriver; //orospu evlatları bize karşı koruma yapmasın diye.
        });

        if (!(url.startsWith("https://") || url.startsWith("http://"))) {
          url = "https://" + url
        }
        await page.goto(url, {
          waitUntil: 'networkidle0'
        })

        if (url.includes("animecix")) {
          //later to be implemented
        } else { //otherwise it is turkanimetv
          await page.evaluate(() => {
            console.clear = () => {} //orospu evlatları konsolu temizleyip durmasın diye ya bre amınakoduklrım devtools açıyorum bakıcam konsola SİLMESENİZE ŞU AMINASOKTUĞUMUN KONSOLUNU
            try {
              document.querySelector(`#videodetay > div > div.pull-right`).childNodes[0].click() //click the first fansub
            } catch (e) {
              document.querySelector(`#videodetay > div > div.btn-group.pull-right`).childNodes[0].click() //click the first fansub
            }
          })

          await page.waitForSelector(".video-icerik").then(() => { //fires when video div is loaded
            turkanimetv.searchVideo(this.browser, page)
            turkanimetv.Events.on("gotURL", (data) => {
              this.emit("gotURL", data)
            })
          })
        }

        await page.setRequestInterception(true)

        universalControllers.trackRequests(page).then((response) => { //fires when video file is caught in the network tab
          this.emit("gotURL", response)
        })
      }, 2000);
    } else {
      throw new Error(`Only ${absoluteURLs.join(", ")} domains are currently supported`)
    }
  }

  terminateSession() {
    this.browser.close()
  }
}

exports.Scraper = Scraper