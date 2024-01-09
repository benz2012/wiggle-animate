const downloadBlob = (blobData, fileName) => {
  const videoObjUrl = URL.createObjectURL(blobData)
  const aTag = document.createElement('a')
  aTag.href = videoObjUrl
  aTag.download = fileName
  document.body.appendChild(aTag)
  aTag.click()
  URL.revokeObjectURL(videoObjUrl)
  aTag.remove()
}

export {
  // eslint-disable-next-line import/prefer-default-export
  downloadBlob,
}
