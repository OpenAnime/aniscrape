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

        })


        
  const getData = async() => {
    return await page.evaluate(async () => {
        return await new Promise(resolve => {
          let get2 = document.querySelector("#videodetay > div > div.pull-right")
          let nodes1 = get2.childNodes
          
          let currentNode = 0
          var res = []
          let inner1 = []
          let turn = false
          
          setInterval(() => {
              try{
              nodes1[currentNode].click()     
                  setTimeout(() => {
                      
              let get = document.querySelector("#videodetay > div > div:nth-child(4)")
                          inner1.push(get.innerHTML)
           
                 currentNode++
                  }, 1000)
              } catch(e) {
                    return
              }
              
             
          }, 3000)
          
          setInterval(() => {
              if(turn == false) {
              if(inner1.length == 1) {
                  changed()
                  turn = true
              }     
              }
             
              if(inner1.length == 2) {
                      changed()
                      inner1.length = 1   
              }
          }, 100)
          
          function changed() {
              try{
             let get = document.querySelector("#videodetay > div > div:nth-child(4)")
                 let nodes = get.childNodes
                let curPlayers = []
          
              nodes.forEach(el => {
                curPlayers.push(el.innerText.toLowerCase())
              })
                res.push({
                    subName: nodes1[currentNode-1].innerText.toLowerCase(),
                    players: curPlayers
                })
                      } catch(e2) {
                         
                      }
          }

          setInterval(() => {
            if(res.length == nodes1.length) {
                resolve(res)
            }
        }, 100)
      })
    })
  }  

  
  boxes2 = await getData();
  console.log(boxes2)


      }, 3000);
    }


  }

  init()
}

startEverything(["https://www.turkanime.co/video/gotoubun-no-hanayome-1-bolum"])