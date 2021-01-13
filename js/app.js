var myVideo, myPlayer;
var canvas = document.querySelector('#overlay');
let streaming = false

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
 
function startCamera() {
  streaming = false
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
 
  recorder = new MediaRecorder(myStream);
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
    blobUrl = null;
  };
  
  if (blobUrl) {
    myPlayer.setAttribute('controls', '')
    myPlayer.setAttribute('width', 320)
    myPlayer.setAttribute('height', 240)
    myPlayer.src = blobUrl;
    // myPlayer.onended = function(){
    //   myPlayer.pause();
    // };
    
    myPlayer.play();
  };
};