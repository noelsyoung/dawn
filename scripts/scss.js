'use strict'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

const fs = require('fs-extra')
const glob = require('glob')
const chokidar = require('chokidar')
const sass = require('sass')
const prettier = require('prettier')
const prettierOptions = require('../.prettierrc')

const paths = {
  watch: ['src/*.scss', 'src/**/*.scss'],
  scssDir: 'src/scss',
  allSass: 'src/**/*.scss'
}

const renderSass = (file, outFile) => {
  sass.render(
    {
      file: file,
      outFile: outFile,
    },
    (error, result) => {
      if (!error) {
        // No errors during the compilation, write this result on the disk
        const css = result.css.toString()
        const prettifiedCss = prettier.format(css, { ...prettierOptions, parser: 'css' })
        fs.writeFile(outFile, prettifiedCss, err => {
          if (err) {
            console.log(`${error}`)
          }
        })
      } else {
        console.log(`${error}`)
      }
    },
  )
}

const outFilePath = path => {
  const fileNoDir = path.substring(path.lastIndexOf('/') + 1, path.length)
  const outPath = 'assets/' + fileNoDir
  return outPath.replace('.scss', '.css')
}

const renderAllSass = () => {
  glob(paths.allSass, { matchBase: true }, (error, files) => {
    if (error) {
      console.log(`${error}`)
    } else {
      files.forEach(file => {
        renderSass(file, outFilePath(file))
      })
    }
  })
}

chokidar.watch(paths.watch).on('all', (event, path) => {
  if (event === 'change') {
    console.log(`SCSS file change: ${path}`)

    if (path.indexOf(paths.scssDir) > -1) {
      // is in the scss dir so render all scss files
      renderAllSass()
    } else {
      renderSass(path, outFilePath(path))
    }
  }
})

renderAllSass()
