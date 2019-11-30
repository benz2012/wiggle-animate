const download = (data, filename, type) => {
  const file = new Blob([data], { type })
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file, filename)
  } else {
    const elm = document.createElement('a')
    const url = window.URL.createObjectURL(file)

    elm.href = url
    elm.download = filename

    document.body.appendChild(elm)
    elm.click()

    setTimeout(() => {
      document.body.removeChild(elm)
      window.URL.revokeObjectURL(url)
    })
  }
}

const downloadJSON = (data, basename) => (
  download(data, `${basename}.json`, 'text/json')
)

export {
  download,
  downloadJSON,
}
