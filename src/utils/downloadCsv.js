import json2csv from 'json2csv'

export function createBlobFromArray (fields, dataArray) {
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
  const json2csvParser = new json2csv.Parser({ fields })
  const csvString = json2csvParser.parse(dataArray)
  return new Blob([ bom, csvString ], {'type': 'text/csv'})
}

export function download (filename, blob) {
  const mimeType = 'text/csv'

  const a = document.createElement('a')
  a.download = filename

  if (window.navigator.msSaveBlob) {
    // for IE
    window.navigator.msSaveBlob(blob, filename)
  } else if (window.URL && window.URL.createObjectURL) {
    // for Firefox
    a.href = window.URL.createObjectURL(blob)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } else if (window.webkitURL && window.webkitURL.createObject) {
    // for Chrome
    a.href = window.webkitURL.createObjectURL(blob)
    a.click()
  } else {
    // for Safari
    window.open('data:' + mimeType + ';base64,' + window.Base64.encode(blob.toString()), '_blank')
  }
}
