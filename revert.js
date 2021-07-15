var https = require('https');
async function imgUrlToBase64(originUrl) {
    const url = 'https://img.nga.178.com/attachments' + originUrl.substring(1)
    let base64Img = ''
    return new Promise(function (resolve, reject) {
      let req = https.get(url, function (res) {
        var chunks = [];
        var size = 0;
        res.on('data', function (chunk) {
          chunks.push(chunk);
          size += chunk.length;　　//累加缓冲数据的长度
        });
        res.on('end', function (err) {
          var data = Buffer.concat(chunks, size);
          base64Img = data.toString('base64');
          resolve({ success: true, base64Img });
        });
      })
      req.on('error', (e) => {
        resolve({ success: false, errmsg: e.message });
      });
      req.end();
    })
  }  
  async function revertMessage(message){
    const re = /(?<=\[img\]).+?(?=\[\/img\])/g
    const UrlArr = []
    let tempUrl = ''
    do {
        const res = re.exec(message)
        if(!res){
            tempUrl = ''
        }else{
            tempUrl = res[0]
            UrlArr.push(tempUrl)
        }
    } while (!tempUrl);
    const processedMessage = message.replace(re,'如图')
    const base64Arr = []
    for(let url of UrlArr){
        const base64Obj = await imgUrlToBase64(url)
        if(base64Obj.success){
            base64Arr.push(base64Obj.base64Img)
        }
    }
    return ({
        processedMessage,
        base64Arr
    })
  }
 revertMessage('[img]./mon_202107/15/jmQ2o-h4j7K1bT1kShs-10o.jpg.medium.jpg[/img]喂喂喂[img]./mon_202107/15/jmQ2o-h4j7K1bT1kShs-10o.jpg.medium.jpg[/img]').then(res => console.log(res))