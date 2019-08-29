const fs = require('fs')
const uuid = require('uuid/v4')
const pdfjsLib = require('pdfjs-dist')
const NodeCanvasFactory = require('./nodeCanvas')


// Relative path of the PDF file.
const pdfURL = './sample.pdf'

// Read the PDF file into a typed array so PDF.js can load it.
const rawData = new Uint8Array(fs.readFileSync(pdfURL))

// Load the PDF file.
const loadingTask = pdfjsLib.getDocument(rawData)

loadingTask.promise
  .then(function(pdfDocument) {
    console.log('# PDF document loaded.')

    // Get the first page.
    pdfDocument.getPage(1).then(function(page) {

      // Render the page on a Node canvas with 100% scale.
      const viewport = page.getViewport({ scale: 1.0 })
      const canvasFactory = new NodeCanvasFactory()
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)
      const renderContext = {
        canvasContext: canvasAndContext.context,
        viewport: viewport,
        canvasFactory: canvasFactory,
      }

      const renderTask = page.render(renderContext)
      renderTask.promise.then(function() {
        // Convert the canvas to an image buffer.
        const image = canvasAndContext.canvas.toBuffer()

        fs.writeFile(`./thumbs/${uuid()}.png`, image, function (error) {
          if (error) {
            console.error('Error: ' + error)
          } else {
            console.log('Finished converting first page of PDF file to a PNG image.')
          }
        })
      })
    })
  })
  .catch(function(reason) {
    console.log(reason)
  })
