const request = require("superagent");
const { shell, ipcRenderer } = require("electron");
const cheerio = require("cheerio");
var iconv = require("iconv-lite");
let is_stop = new Map(); ///思考点  放进function里就不行
// ipcRenderer.on("stop", (event, indexStop) => {
//   is_stop.set(indexStop[0], indexStop[1]);
// });
const userAgent = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3100.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Chrome/22.0.1216.0 Safari/537.2",
  "Opera/9.80 (Windows NT 6.1; U; zh-cn) Presto/2.6.37 Version/11.00",
  "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
];
function wrapper(node) {
  const index = node.getAttribute("id");
  const input = node.querySelector(".uid");
  const start = node.querySelector(".start");
  const end = node.querySelector(".end");
  const refresh = node.querySelector(".refresh");
  const post = node.querySelector(".post");
  const reply = node.querySelector(".reply");
  const aTag = node.getElementsByTagName("a")[0];
  aTag.className = "negative";
  end.setAttribute("disabled", true);
  refresh.setAttribute("disabled", true);
  let timer = null;
  let last_reply = reply.innerHTML;
  let is_refresh = false;
  refresh.onclick = async () => {
    if (!is_refresh) {
      is_refresh = true;
      end.click();
      start.click();
      refresh.click();
      return;
    }
    is_refresh = false;
    const val = input.value;
    if (!val) {
      alert("请输入uid");
      return;
    }
    refresh.setAttribute("disabled", true);
    refresh.classList.add("blue");
    do {
      await request
        .get(`https://bbs.nga.cn/thread.php?searchpost=1&authorid=${val}`)
        .set(
          "Cookie",
          "ngaPassportUid=60373669;bbsmisccookies=%7B%22uisetting%22%3A%7B0%3A1%2C1%3A1624089387%7D%2C%22pv_count_for_insad%22%3A%7B0%3A-20%2C1%3A1623517270%7D%2C%22insad_views%22%3A%7B0%3A1%2C1%3A1623517270%7D%7D;ngaPassportCid=X8p9hg4ir81gqg4026ruf38qje7c12fp2t8hip34"
        )
        .set("User-Agent", userAgent[Math.floor(Math.random() * 4)])
        .responseType("blob")
        .then((response) => {
          if (!response) {
            return;
          }
          const html = iconv.decode(response.body, "GBK");
          const $ = cheerio.load(html);
          const res = $(".topic_content:first").children(".postcontent").text();
          if (res !== "") {
            // ipcRenderer.send("stop-refresh", [index, true]);
            `最新回复：&nbsp;${res}` !== last_reply
              ? alert("刷到最新回复啦！")
              : alert("已经是最新回复啦");
            last_reply = reply.innerHTML = `最新回复：&nbsp;${res}`;
            refresh.removeAttribute("disabled");
            is_stop.set(index, true);
          }
        });
    } while (is_stop.get(index) !== true);
    refresh.classList.remove("blue");
  };
  aTag.onclick = function (e) {
    e.preventDefault();
    let href = this.getAttribute("href");
    shell.openExternal(href);
  };
  start.onclick = function () {
    const val = input.value;
    if (!val) {
      alert("请输入uid");
      return;
    }
    // ipcRenderer.send("stop-refresh", [index, false]);
    is_stop.set(index, false);
    refresh.removeAttribute("disabled");
    aTag.className = "positive";
    aTag.setAttribute(
      "href",
      `https://bbs.nga.cn/thread.php?searchpost=1&authorid=${val}`
    );
    end.removeAttribute("disabled");
    start.setAttribute("disabled", true);
    let tmp = 0;
    let has_reply = false;
    input.setAttribute("disabled", true);
    request
      .get(`https://bbs.nga.cn/nuke.php?__lib=ucp&__act=get&lite=js&uid=${val}`)
      .set(
        "Cookie",
        "ngaPassportUid=60373669;bbsmisccookies=%7B%22uisetting%22%3A%7B0%3A1%2C1%3A1624089387%7D%2C%22pv_count_for_insad%22%3A%7B0%3A-20%2C1%3A1623517270%7D%2C%22insad_views%22%3A%7B0%3A1%2C1%3A1623517270%7D%7D;ngaPassportCid=X8p9hg4ir81gqg4026ruf38qje7c12fp2t8hip34"
      )
      .set("User-Agent", userAgent[Math.floor(Math.random() * 4)])
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
      .set("User-Agent", userAgent[Math.floor(Math.random() * 4)])
      .responseType("blob")
      .end(function (err, response) {
        if (!response) {
          return;
        }
        const html = iconv.decode(response.body, "GBK");
        const $ = cheerio.load(html);
        const res = $(".topic_content:first").children(".postcontent").text();
        if (res) {
          last_reply = reply.innerHTML = `最新回复：&nbsp;${res}`;
        }
      });

    const checkFunction = async () => {
      let option0 = {};
      request
        .get(
          `https://bbs.nga.cn/nuke.php?__lib=ucp&__act=get&lite=js&uid=${val}`
        )
        .set(
          "Cookie",
          "ngaPassportUid=60373669;bbsmisccookies=%7B%22uisetting%22%3A%7B0%3A1%2C1%3A1624089387%7D%2C%22pv_count_for_insad%22%3A%7B0%3A-20%2C1%3A1623517270%7D%2C%22insad_views%22%3A%7B0%3A1%2C1%3A1623517270%7D%7D;ngaPassportCid=X8p9hg4ir81gqg4026ruf38qje7c12fp2t8hip34"
        )
        .set("User-Agent", userAgent[Math.floor(Math.random() * 4)])
        .set("Referer", `https://bbs.nga.cn/nuke.php?func=ucp&uid=${val}`)
        .responseType("blob")
        .end(async function (_err, response) {
          if (!response) {
            return;
          }
          const res = eval(iconv.decode(response.body, "GBK"));
          if (res.data[0].posts !== tmp) {
            has_reply = false;
            ipcRenderer.send("notice");
            tmp = res.data[0].posts;
            post.innerHTML = `${res.data[0].username}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最新发帖数：${res.data[0].posts}`;
            function callSuperagent() {
              return new Promise((resolve, reject) => {
                return request
                  .get(
                    `https://bbs.nga.cn/thread.php?searchpost=1&authorid=${val}`
                  )
                  .set(
                    "Cookie",
                    "ngaPassportUid=60373669;bbsmisccookies=%7B%22uisetting%22%3A%7B0%3A1%2C1%3A1624089387%7D%2C%22pv_count_for_insad%22%3A%7B0%3A-20%2C1%3A1623517270%7D%2C%22insad_views%22%3A%7B0%3A1%2C1%3A1623517270%7D%7D;ngaPassportCid=X8p9hg4ir81gqg4026ruf38qje7c12fp2t8hip34"
                  )
                  .set("User-Agent", userAgent[Math.floor(Math.random() * 4)])
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
                      last_reply = reply.innerHTML = `最新回复：&nbsp;${resp}`;
                      option0 = {
                        title: res.data[0].username,
                        body: resp,
                      };
                    }
                    resolve();
                  });
              });
            }
            await callSuperagent();

            let option1 = {
              title: res.data[0].username,
              body: "点击强刷回复",
            };
            let myNotification = new window.Notification(
              option1.title,
              has_reply ? option0 : option1
            );
            const target_url = `https://bbs.nga.cn/thread.php?searchpost=1&authorid=${val}`;
            myNotification.onclick = () => {
              if (has_reply) {
                shell.openExternal(target_url);
              } else {
                end.click();
                start.click();
                refresh.click();
              }
            };
          }
        });
      timer = setTimeout(checkFunction, 1000);
    };
    timer = setTimeout(checkFunction, 1000);
  };
  end.onclick = function () {
    // ipcRenderer.send("stop-refresh", [index, true]);
    is_stop.set(index, true);
    clearTimeout(timer);
    refresh.setAttribute("disabled", true);
    post.innerHTML = "";
    reply.innerHTML = "";
    input.removeAttribute("disabled");
    start.removeAttribute("disabled");
    end.setAttribute("disabled", true);
    aTag.className = "negative";
  };
}

window.onload = function () {
  const btn = document.querySelector("#add");
  const btnDelete = document.querySelector("#delete");
  btnDelete.onclick = () => {
    const wrapperList = document.querySelectorAll(".wrapper");
    const body = document.body;
    const node = body.lastElementChild;
    body.removeChild(node);
    if (wrapperList.length === 1) {
      btnDelete.setAttribute("disabled", true);
    }
  };
  btn.onclick = function () {
    const wrapperList = document.querySelectorAll(".wrapper");
    btnDelete.removeAttribute("disabled");
    const node = wrapperList[0];
    const new_node = node.cloneNode(true);
    new_node.setAttribute("id", `${wrapperList.length}`);
    document.body.appendChild(new_node);
    const input = new_node.querySelector(".uid");
    const start = new_node.querySelector(".start");
    const end = new_node.querySelector(".end");
    const post = new_node.querySelector(".post");
    const reply = new_node.querySelector(".reply");
    input.value = "";
    input.removeAttribute("disabled");
    start.removeAttribute("disabled");
    end.setAttribute("disabled", true);
    post.innerHTML = "";
    reply.innerHTML = "";
    try {
      wrapper(new_node);
    } catch (error) {
      alert(error);
    }
  };
  let inputList = this.document.querySelectorAll(".uid");
  inputList[0].value = 5348023;
  inputList[1].value = 61078637;
  // inputList[1].value = 60373669;
  const wrapperList = document.querySelectorAll(".wrapper");
  try {
    wrapper(wrapperList[0]);
  } catch (error) {
    alert(error);
  }
  try {
    wrapper(wrapperList[1]);
  } catch (error) {
    alert(error);
  }
};
