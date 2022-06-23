const absoluteURLs = ["animecix.net", "www.turkanime.co"]
const puppeteer = require("puppeteer-core")
const universalControllers = require("./Universal-Controllers")
const turkanimetv = require("./TurkAnimeTV-Controllers")
const AnimeciXControllers = require("./AnimeciX-Controllers")
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
          AnimeciXControllers.searchVideo(this.browser, page)
          AnimeciXControllers.Events.on("gotURL", (data) => {
            this.emit("gotURL", data)
          })
        } else { //otherwise it is turkanimetv
            turkanimetv.searchVideo(this.browser, page)
            turkanimetv.Events.on("gotURL", (data) => {
              this.emit("gotURL", data)
            })
          }

        await page.setRequestInterception(true)

        universalControllers.trackRequests(page) //just continue the request
      }, 2000);
    } else {
      throw new Error(`Only ${absoluteURLs.join(", ")} domains are currently supported`)
    }
  }
    /**
   * Terminates the current web scraping session.
   */
  terminateSession() {
    AnimeciXControllers.ended = true
    turkanimetv.ended = true
    this.browser.close()
  }
}

exports.Scraper = Scraper