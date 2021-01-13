var myVideo, myPlayer;
 
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
  navigator.mediaDevices.getUserMedia({ audio: false, video:{ width:320, height:240} })
  .then(function(stream){
    if("srcObject" in myVideo) myVideo.srcObject = stream;
    else myVideo.src = window.URL.createObjectURL(stream);
    myVideo.onloadedmetadata = function (e) {
      myStream = stream;
      myVideo.play();
      
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
function beginRecorde(){
  if(!myStream) return;
  if(recorder) return;
 
  recorder = new MediaRecorder(myStream, {
    audioBitsPerSecond : 64000,
    videoBitsPerSecond : 512000,
    mimeType : 'video/webm; codecs=vp9'
  });
  chunks = [];
 
  startPlayer()
  
  recorder.onstop = function(e){
    recorder = null;
    
  };
  recorder.start(1000);
};
 
function endRecorde(){
  if(recorder) recorder.stop();
};
 
//========== Player ==========//
var blobUrl = null;
function startPlayer() {

  recorder.ondataavailable = function (e) {
    if(!blobUrl){
    window.URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  };
  // var videoBlob = new Blob(chunks, { type : "video/webm" });
  blobUrl = window.URL.createObjectURL(e.data);
  if (blobUrl) {
     myPlayer.setAttribute('controls', '')
    myPlayer.setAttribute('width', 320)
    myPlayer.setAttribute('height', 240)
    chunks.push(e.data);
    myPlayer.src = blobUrl;
    // myPlayer.onended = function(){
      // myPlayer.pause();
      // myPlayer.src = "";
    // };
    // myPlayer.play();
  };
    
  };
  
};
