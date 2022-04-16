async function startEverything(link) {

  const {
    JsonDatabase
  } = require("wio.db");

  const db = new JsonDatabase({
    databasePath: "../db.json"
  });

  let chalk_base = await import("chalk");
  const chalk = chalk_base.default;
  let currentIndex = -1

  async function init() {
    currentIndex++
    if (currentIndex !== link.length) {
      const puppeteer = require('puppeteer-extra')

      let went = false
      const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: [
          `--disable-extensions-except=C:\\Users\\Asus\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\cjpalhdlnbpafiamejdnhcphjbkeiagm\\1.42.4_0`, //uBlock origin path
          `--load-extension=C:\\Users\\Asus\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\cjpalhdlnbpafiamejdnhcphjbkeiagm\\1.42.4_0`, //uBlock origin path
        ]
      })
      setTimeout(async () => {
        const page = await browser.newPage()
        await page.setRequestInterception(true);
        page.on('request', async (interceptedRequest) => {
          if (interceptedRequest.isInterceptResolutionHandled()) return;

          if (interceptedRequest.url().includes(".mp4")) {
            console.log(chalk.green("Uygun oynatıcı bulundu video veritabanına kaydediliyor..."))
            if (interceptedRequest.url().startsWith("https://")) {
              db.set(link[currentIndex].replace("https://www.turkanime.co/video/", ""), interceptedRequest.url())
            }
            await browser.close()
            console.log(chalk.yellow("Veritabanına kaydedildi"))
            init()
          }


          if (went == true) {
            interceptedRequest.continue();
            return
          } else {
            if (interceptedRequest.url().includes("suzihaza.com/v/")) {//fembedin mp4 linkleri suzihaza diye bir yerde saklanıyo
              went = true
              await page.goto(interceptedRequest.url()).then(async () => {
                setTimeout(async () => {
                  await page.waitForSelector("#loading").then(async () => {
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
       await page.evaluate(async () => { //her 100 milisaniyede console clear çekiyor ramin içinden geçmemesi için
          console.clear = () => {}
        })

        const getData = async () => {
          console.log(chalk.blue("Uygun oynatıcı bulma işlemi başlatıldı..."))
          return await page.evaluate(async () => {
            return await new Promise(resolve => {
              let get2 = document.querySelector("#videodetay > div > div.pull-right")
              let nodes1 = get2.childNodes
              let currentNode = 0
              var res = []
              let inner1 = []
              let turn = false

              setInterval(() => {
                try {
                  nodes1[currentNode].click()
                  setTimeout(() => {

                    let get = document.querySelector("#videodetay > div > div:nth-child(4)")
                    inner1.push(get.innerHTML)
                    currentNode++
                  }, 1000)
                } catch (e) {
                  return
                }
              }, 3000)

              setInterval(() => {
                if (turn == false) {
                  if (inner1.length == 1) {
                    changed()
                    turn = true
                  }
                }

                if (inner1.length == 2) {
                  changed()
                  inner1.length = 1
                }
              }, 100)

              function changed() {
                try {
                  let get = document.querySelector("#videodetay > div > div:nth-child(4)")
                  let nodes = get.childNodes
                  let curPlayers = []

                  nodes.forEach(el => {
                    curPlayers.push(el.innerText.toLowerCase().trim())
                  })
                  res.push({
                    subName: nodes1[currentNode - 1].innerText.toLowerCase().trim(),
                    players: curPlayers
                  })
                } catch (e2) {}
              }

              setInterval(() => { //tüm fansubların playerlarının verisi çekildiği zaman resolve yap
                if (res.length == nodes1.length) {
                  resolve(res)
                }
              }, 100)
            })
          })
        }


        boxes2 = await getData();
        let filterIt = boxes2.filter(x => x.players.includes("fembed"))
        let index = boxes2.indexOf(filterIt[0])
        let index2 = boxes2[index].players.indexOf("fembed")
        await page.evaluate(async (index, index2) => {
          let select = document.querySelector(`#videodetay > div > div.btn-group.pull-right > button:nth-child(${index+1})`)
          select.click()
          setTimeout(() => {
            let select2 = document.querySelector(`#videodetay > div > div:nth-child(4) > button:nth-child(${index2+1})`)
            select2.click()
          }, 1000);
        }, index, index2)
      }, 3000);
    }
  }
  init()
}

startEverything([`https://www.turkanime.co/video/gotoubun-no-hanayome-1-bolum`, `https://www.turkanime.co/video/gotoubun-no-hanayome-2-bolum`])