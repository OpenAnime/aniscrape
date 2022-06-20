module.exports = {
 trackRequests: async function (page) {
  return new Promise((resolve) => {
   page.on('request', async (interceptedRequest) => {
    if (interceptedRequest.isInterceptResolutionHandled()) return;
    if (interceptedRequest.resourceType() == "media") {
     if (interceptedRequest.url().includes("mp4")) {
      //resolve the url of the video
      resolve(interceptedRequest.url())
     }
    }
    interceptedRequest.continue()
   })
  })
 }
}