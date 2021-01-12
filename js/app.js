var video = document.querySelector('#video');
var canvas = document.querySelector('#overlay');
var context = canvas.getContext('2d');
var startbutton = document.querySelector('#startbutton')
var stopbutton = document.querySelector('#stopbutton')
var downloadbutton = document.querySelector('#download')
let streaming = false
let width = 320
let height = 0
var constraints = {
  audio: false,
  video: {
    // スマホのバックカメラを使用
    facingMode: "user",
    width: 320,
    height: 240
  }
};
let recorder = null
let record_data = []
var track = new clm.tracker({
  useWebGL: true
});

function adjustVideo() {
  // 映像が画面幅いっぱいに表示されるように調整
  var ratio = window.innerWidth / video.videoWidth;

  video.width = window.innerWidth;
  video.height = video.videoHeight * ratio;
  canvas.width = video.width;
  canvas.height = video.height;
}

function startTracking() {
  // トラッキング開始
  track.start(video);
  drawLoop();
}

function drawLoop() {
  // 描画をクリア
  context.clearRect(0, 0, canvas.width, canvas.height);
  // videoをcanvasにトレース
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (track.getCurrentPosition()) {
    // 顔のパーツの現在位置が存在
    track.draw(canvas);
  }
  requestAnimationFrame(drawLoop);
}

track.init(pModel);



/**
 * ユーザーのデバイスによるカメラ表示を開始し、
 * 各ボタンの挙動を設定する
 *
 */
function startup() {

  videoStart()

  video.addEventListener('canplay', function (ev) {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width)

      video.setAttribute('width', width)
      video.setAttribute('height', height)
      streaming = true
    }
  }, false)

  startRecorder()

  // 「start」ボタンをとる挙動を定義
  startbutton.addEventListener('click', function (ev) {
    recorder.start()
    ev.preventDefault()
  }, false);

  stopbutton.addEventListener('click', function (ev) {
    recorder.stop()
  })

  downloadbutton.addEventListener('click', function (ev) {
    console.log(record_data)
    var blob = new Blob(record_data, { type: 'video/webm' })
    var url = window.URL.createObjectURL(blob)
    var a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display:none'
    a.href = url;
    a.download = 'test.webm'
    a.click()
    window.URL.revokeObjectURL(url)
  })
}


/**
   * カメラ操作を開始する
   */
function videoStart() {
  streaming = false
  console.log(streaming)
  console.log(navigator.mediaDevices.getSupportedConstraints())
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
      video.srcObject = stream
      video.onloadedmetadata = (e) => {
        video.play()
      }
    })
    .catch(function (err) {
      console.log("An error occured! " + err)
    })
}




// カメラから映像を取得
function startRecorder() {
  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      recorder = new MediaRecorder(stream)
      recorder.ondataavailable = function (e) {
        var testvideo = document.querySelector('#test')
        testvideo.setAttribute('controls', '')
        testvideo.setAttribute('width', width)
        testvideo.setAttribute('height', height)
        var outputdata = window.URL.createObjectURL(e.data)
        record_data.push(e.data)
        testvideo.src = outputdata
      }
      // 動画のメタ情報のロードが完了したら実行
      video.onloadedmetadata = function() {
        adjustVideo();
        startTracking();
      };
    })
    .catch((err) => {
      window.alert(err.name + ': ' + err.message);
    });
}

startup()