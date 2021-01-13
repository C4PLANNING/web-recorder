var myVideo, myPlayer;
// var canvas = document.querySelector('#overlay');

window.onload = function(){
  if(navigator.mediaDevices === undefined) navigator.mediaDevices = {};
  if(navigator.mediaDevices.getUserMedia === undefined){
    navigator.mediaDevices.getUserMedia = function(constraints){
      var getUserMedia = (navigator.webkitGetUserMedia
                       || navigator.mozGetUserMedia
                       || navigator.msGetUserMedia
                       || navigator.getUserMedia);
      if(!getUserMedia) return Promise.reject(new Error('非対応ブラウザ'));
      return new Promise(function(resolve, reject){
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  };
 
  myVideo  = document.getElementById('myVideo');
  myPlayer = document.getElementById('myPlayer');
};
 
//========== Camera ==========//
var myStream = null;
 
function startCamera(){
  navigator.mediaDevices.getUserMedia({ audio: false, video:{ width:320, height:240, facingMode: "environment"} })
  .then(function(stream){
    if("srcObject" in myVideo) myVideo.srcObject = stream;
    else myVideo.src = window.URL.createObjectURL(stream);
    myVideo.onloadedmetadata = function(e){
      myVideo.play();
      myStream = stream;
    };
  })
  .catch(function(err){ console.log(err.name + ": " + err.message); });
};
 
function stopCamera(){
  if(myStream){
    for(track of myStream.getTracks()) track.stop();
    myStream = null;
  };
  myVideo.pause();
  if("srcObject" in myVideo) myVideo.srcObject = null;
  else myVideo.src = null;
};
 
//========== Recorder ==========//
var recorder = null;
var chunks = [];
var blobUrl = null;
function beginRecorde(){
  if(!myStream) return;
  if(recorder) return;
 
  recorder = new MediaRecorder(myStream, {
    audioBitsPerSecond : 64000,
    videoBitsPerSecond : 512000,
    mimeType : 'video/webm; codecs=vp9'
  });
  chunks = [];
 
  recorder.ondataavailable = function (e) {
    var videoBlob = new Blob(chunks, { type : "video/webm" });
    blobUrl = window.URL.createObjectURL(videoBlob);
    chunks.push(e.data);
  };
  recorder.onstop = function(e){
    recorder = null;
    startPlayer();
  };
  recorder.start(1000);
};
 
function endRecorde(){
  if(recorder) recorder.stop();
};
 
//========== Player ==========//

function startPlayer(){
  if(!blobUrl){
    window.URL.revokeObjectURL(blobUrl);
    console.log("error")
    blobUrl = null;
  };
  
  if (blobUrl) {
    myPlayer.setAttribute('controls', '')
    myPlayer.setAttribute('width', 320)
    myPlayer.setAttribute('height', 240)
    myPlayer.src = blobUrl;
    console.log(myPlayer)
    myPlayer.onended = function(){
      myPlayer.pause();
    };
    
    
  };
};

let width = 320    // We will scale the photo width to this
let height = 0     // This will be computed based on the input stream

let streaming = false

var video = null
let canvas = null
let photo = null
let startbutton = null
let constrains = { video: true, audio: true }
let recorder2 = null
let record_data = []

/**
 * ユーザーのデバイスによるカメラ表示を開始し、
 * 各ボタンの挙動を設定する
 *
 */
function startup() {
    video = document.getElementById('video')
    canvas = document.getElementById('canvas')
    photo = document.getElementById('photo')
    startbutton = document.getElementById('startbutton')
    stopbutton = document.getElementById('stopbutton')
    downloadbutton = document.getElementById('download')
    
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
        recorder2.start()
        ev.preventDefault()
    }, false);

    stopbutton.addEventListener('click', function (ev) {
        recorder2.stop()
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
    navigator.mediaDevices.getUserMedia(constrains)
        .then(function (stream) {
            video.srcObject = stream
            video.play()
        })
        .catch(function (err) {
            console.log("An error occured! " + err)
        })
}

function startRecorder() {
    navigator.mediaDevices.getUserMedia(constrains)
        .then(function (stream) {
            recorder2 = new MediaRecorder(stream)
            recorder2.ondataavailable = function (e) {
                var testvideo = document.getElementById('test')
                testvideo.setAttribute('controls', '')
                testvideo.setAttribute('width', width)
                testvideo.setAttribute('height', height)
                var outputdata = window.URL.createObjectURL(e.data)
                record_data.push(e.data)
                testvideo.src = outputdata
            }
        })
}

startup()