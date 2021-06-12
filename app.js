const request = require("superagent");
const { shell } = require("electron");
const cheerio = require("cheerio");
var iconv = require("iconv-lite");

function wrapper(index) {
  let btn0 = this.document.querySelector(`#start${index}`);
  let btn1 = this.document.querySelector(`#end${index}`);
  let post = this.document.querySelector(`#post${index}`);
  let reply = this.document.querySelector(`#reply${index}`);
  let input = this.document.querySelector(`#uid${index}`);
  let timer = null;
  btn0.onclick = function () {
    let tmp = 0;
    let has_reply = false
    const val = input.value;
    input.setAttribute("disabled", true);
    request
      .get(`https://bbs.nga.cn/nuke.php?__lib=ucp&__act=get&lite=js&uid=${val}`)
      .set(
        "Cookie",
        "ngaPassportUid=60373669;bbsmisccookies=%7B%22uisetting%22%3A%7B0%3A1%2C1%3A1624089387%7D%2C%22pv_count_for_insad%22%3A%7B0%3A-20%2C1%3A1623517270%7D%2C%22insad_views%22%3A%7B0%3A1%2C1%3A1623517270%7D%7D;ngaPassportCid=X8p9hg4ir81gqg4026ruf38qje7c12fp2t8hip34"
      )
      .set("Referer", `https://bbs.nga.cn/nuke.php?func=ucp&uid=${val}`)
      .responseType("blob")
      .end(function (err, response) {
        if (!response) {
          return;
        }
        const res = eval(iconv.decode(response.body, "GBK"));
        post.innerHTML = `${res.data[0].username}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最新发帖数：${res.data[0].posts}`;
        tmp = res.data[0].posts;
      });
    request
      .get(`https://bbs.nga.cn/thread.php?searchpost=1&authorid=${val}`)
      .set(
        "Cookie",
        "ngaPassportUid=60373669;bbsmisccookies=%7B%22uisetting%22%3A%7B0%3A1%2C1%3A1624089387%7D%2C%22pv_count_for_insad%22%3A%7B0%3A-20%2C1%3A1623517270%7D%2C%22insad_views%22%3A%7B0%3A1%2C1%3A1623517270%7D%7D;ngaPassportCid=X8p9hg4ir81gqg4026ruf38qje7c12fp2t8hip34"
      )
      .responseType("blob")
      .end(function (err, response) {
        if (!response) {
          return;
        }
        const html = iconv.decode(response.body, "GBK");
        const $ = cheerio.load(html);
        const res = $(".topic_content:first").children(".postcontent").text();
          reply.innerHTML = `最新回复：&nbsp;${res}`;  
      });
      
    timer = setInterval(() => {
      let option0 = {};
      request
        .get(
          `https://bbs.nga.cn/nuke.php?__lib=ucp&__act=get&lite=js&uid=${val}`
        )
        .set(
          "Cookie",
          "ngaPassportUid=60373669;bbsmisccookies=%7B%22uisetting%22%3A%7B0%3A1%2C1%3A1624089387%7D%2C%22pv_count_for_insad%22%3A%7B0%3A-20%2C1%3A1623517270%7D%2C%22insad_views%22%3A%7B0%3A1%2C1%3A1623517270%7D%7D;ngaPassportCid=X8p9hg4ir81gqg4026ruf38qje7c12fp2t8hip34"
        )
        .set("Referer", `https://bbs.nga.cn/nuke.php?func=ucp&uid=${val}`)
        .responseType("blob")
        .end(async function (_err, response) {
          if (!response) {
            return;
          }
          const res = eval(iconv.decode(response.body, "GBK"));
          if (res.data[0].posts !== tmp) {
            tmp = res.data[0].posts;
            post.innerHTML = `${res.data[0].username}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最新发帖数：${res.data[0].posts}`;
            function callSuperagent() {
              return new Promise((resolve, reject) => {
                
                  return request
                  .get(`https://bbs.nga.cn/thread.php?searchpost=1&authorid=${val}`)
                  .set(
                    "Cookie",
                    "ngaPassportUid=60373669;bbsmisccookies=%7B%22uisetting%22%3A%7B0%3A1%2C1%3A1624089387%7D%2C%22pv_count_for_insad%22%3A%7B0%3A-20%2C1%3A1623517270%7D%2C%22insad_views%22%3A%7B0%3A1%2C1%3A1623517270%7D%7D;ngaPassportCid=X8p9hg4ir81gqg4026ruf38qje7c12fp2t8hip34"
                  )
                  .responseType("blob")
                  .end(function (_err, response) {
                      if (!response) {
                        return;
                      }
                      const html = iconv.decode(response.body, "GBK");
                      const $ = cheerio.load(html);
                      const resp = $(".topic_content:first")
                        .children(".postcontent")
                        .text();
                      if (resp) {
                        has_reply = true;
                        reply.innerHTML = `最新回复：&nbsp;${resp}`;
                        option0 = {
                          title: res.data[0].username,
                          body: resp,
                        };
                      }
                      resolve()
                  });
              });
          }
            post.innerHTML = ''
            await callSuperagent()
            
            let option1 = {
              title: res.data[0].username,
              body: res.data[0].posts,
            };
            let myNotification = new window.Notification(
              option1.title,
              has_reply ? option0 : option1
            );
            myNotification.onclick = () => {
              shell.openExternal(
                has_reply
                  ? `https://bbs.nga.cn/nuke.php?__lib=ucp&__act=get&lite=js&uid=${val}`
                  : `https://bbs.nga.cn/thread.php?searchpost=1&authorid=${val}`
              );
            };
            has_reply = false
          }
        });
    }, 100);
  };
  btn1.onclick = function () {
    clearInterval(timer);
    post.innerHTML = "";
    reply.innerHTML = '';
    input.removeAttribute("disabled");
  };
}

window.onload = function () {
  wrapper(0);
  wrapper(1);
};
