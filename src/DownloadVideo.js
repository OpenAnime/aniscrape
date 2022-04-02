function startEverything(link) {

  let currentIndex = -1

  async function init() {
    currentIndex++
    if (currentIndex == link.length) {
      setTimeout(() => {

      }, 3600000);
    } else {

      const puppeteer = require('puppeteer-extra')

      let went = false
      let fansubNames = []
      const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: [
          `--disable-extensions-except=C:\\Users\\Asus\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\cjpalhdlnbpafiamejdnhcphjbkeiagm\\1.41.8_0`,
          `--load-extension=C:\\Users\\Asus\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\cjpalhdlnbpafiamejdnhcphjbkeiagm\\1.41.8_0`,
        ]
      })
      setTimeout(async () => {
        const page = await browser.newPage()
        await page.setRequestInterception(true);
        page.on('request', async (interceptedRequest) => {
          if (interceptedRequest.isInterceptResolutionHandled()) return;

          if (interceptedRequest.url().includes(".mp4")) {
            const http = require('node:https')
            const fs = require('node:fs')
            const file = fs.createWriteStream(currentIndex + ".mp4");
            const request = http.get(interceptedRequest.url(), async function (response) {
              response.pipe(file);
              await browser.close()

              file.on("finish", () => {
                file.close();
                console.log("yüklendi itşe.");
              });
              init()
            });
          }


          if (went == true) {
            interceptedRequest.continue();
            return
          } else {
            if (interceptedRequest.url().includes("suzihaza.com/v/")) {
              went = true
              await page.goto(interceptedRequest.url()).then(async() => {
                setTimeout(async() => {
                  await page.waitForSelector("#loading").then(async() => {
                    await page.evaluate(() => {
                      document.querySelector("#loading > div").click()
                    })  
                  })
                }, 2000);
              }) 
            }
          }
          interceptedRequest.continue();

        });
        await page.goto(link[currentIndex])
        console.log(link[currentIndex])
        var eval = await page.evaluate(async () => {
          console.clear = () => {}
        }, fansubNames)
      }, 3000);
    }


  }

  init()
}

startEverything(["https://www.turkanime.co/video/gotoubun-no-hanayome-1-bolum"])