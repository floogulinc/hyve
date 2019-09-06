const fs = require('fs')
const path = require('path')
const fileType = require('file-type')
const readChunk = require('read-chunk')

const config = require('../config')

function getFilePathWithExtension (directory, hash) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, filePaths) => {
      if (err) {
        reject(err)
      }

      for (const filePath of filePaths) {
        if (filePath.startsWith(hash)) {
          resolve(path.join(directory, filePath))
        }
      }

      reject(new Error('No matching file found.'))
    })
  })
}

async function fileExists (type, hash) {
  const directory = config.hydrusFilesMode === 'client'
    ? type === 'thumbnail'
      ? `t${hash.substring(0, 2)}`
      : `f${hash.substring(0, 2)}`
    : hash.substring(0, 2)
  const extension = type === 'thumbnail' ? '.thumbnail' : ''

  let filePath = path.join(
    config.hydrusFilesPath, directory, `${hash}${extension}`
  )

  if (type !== 'thumbnail' && config.hydrusFilesMode === 'client') {
    filePath = await getFilePathWithExtension(
      path.join(config.hydrusFilesPath, directory),
      hash
    )
  }

  return new Promise((resolve, reject) => {
    fs.access(filePath, err => {
      if (err) {
        reject(err)
      }

      resolve(true)
    })
  })
}

async function getFileData (type, hash) {
  const directory = config.hydrusFilesMode === 'client'
    ? type === 'thumbnail'
      ? `t${hash.substring(0, 2)}`
      : `f${hash.substring(0, 2)}`
    : hash.substring(0, 2)
  const extension = type === 'thumbnail' ? '.thumbnail' : ''

  let filePath = path.join(
    config.hydrusFilesPath, directory, `${hash}${extension}`
  )

  if (type !== 'thumbnail' && config.hydrusFilesMode === 'client') {
    filePath = await getFilePathWithExtension(
      path.join(config.hydrusFilesPath, directory),
      hash
    )
  }

  const fileInfo = fileType(
    await readChunk(filePath, 0, fileType.minimumBytes)
  )

  return {
    path: filePath,
    mimeType: fileInfo && fileInfo.mime
      ? fileInfo.mime
      : 'application/octet-stream'
  }
}

module.exports = {
  fileExists,
  getFileData
}
