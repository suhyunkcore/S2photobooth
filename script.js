const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cameraScreen = document.getElementById("cameraScreen");
const resultScreen = document.getElementById("resultScreen");

const captureBtn = document.getElementById("captureBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const backBtn = document.getElementById("backBtn");

const countdown = document.getElementById("countdown");
const photoCount = document.getElementById("photoCount");

const filterButtons = document.querySelectorAll(".filterBtn");
const frameButtons = document.querySelectorAll(".frameBtn");

let photos = [];
let selectedFilter = "none";
let selectedFrame = "frame1.png";

let frameImage = new Image();
frameImage.src = selectedFrame + "?v=" + Date.now();

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    video.srcObject = stream;
  } catch (error) {
    alert("카메라 권한을 허용해주세요.");
    console.error(error);
  }
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.videoWidth / img.videoHeight;
  const boxRatio = w / h;

  let sx, sy, sw, sh;

  if (imgRatio > boxRatio) {
    sh = img.videoHeight;
    sw = sh * boxRatio;
    sx = (img.videoWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.videoWidth;
    sh = sw / boxRatio;
    sx = 0;
    sy = (img.videoHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function takePhoto() {
  const temp = document.createElement("canvas");
  temp.width = 500;
  temp.height = 340;

  const tctx = temp.getContext("2d");

  tctx.save();
  tctx.filter = selectedFilter;
  tctx.translate(temp.width, 0);
  tctx.scale(-1, 1);
  drawImageCover(tctx, video, 0, 0, temp.width, temp.height);
  tctx.restore();

  photos.push(temp);
  photoCount.innerText = photos.length + " / 4";
  drawStrip();

  if (photos.length === 4) {
    setTimeout(() => {
      cameraScreen.classList.add("hidden");
      resultScreen.classList.remove("hidden");
      drawStrip();
    }, 500);
  }
}

function drawStrip() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  photos.forEach((photo, index) => {
    const y = 120 + index * 375;
    ctx.drawImage(photo, 50, y, 500, 340);
  });

  if (frameImage.complete) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }
}

captureBtn.addEventListener("click", () => {
  if (photos.length >= 4) {
    alert("4컷 촬영이 완료되었습니다.");
    return;
  }

  let count = 3;
  countdown.innerText = count;

  const timer = setInterval(() => {
    count--;

    if (count > 0) {
      countdown.innerText = count;
    } else {
      clearInterval(timer);
      countdown.innerText = "찰칵!";
      takePhoto();

      setTimeout(() => {
        countdown.innerText = "";
      }, 700);
    }
  }, 1000);
});

resetBtn.addEventListener("click", () => {
  photos = [];
  photoCount.innerText = "0 / 4";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedFilter = button.dataset.filter;
    video.style.filter = selectedFilter;

    filterButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

frameButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedFrame = button.dataset.frame;

    frameImage = new Image();
    frameImage.src = selectedFrame + "?v=" + Date.now();

    frameImage.onload = () => {
      drawStrip();
    };
  });
});

downloadBtn.addEventListener("click", () => {
  if (photos.length === 0) {
    alert("먼저 사진을 촬영해주세요.");
    return;
  }

  const link = document.createElement("a");
  link.download = "my-photobooth.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

backBtn.addEventListener("click", () => {
  photos = [];
  photoCount.innerText = "0 / 4";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  resultScreen.classList.add("hidden");
  cameraScreen.classList.remove("hidden");
});

frameImage.onload = () => {
  drawStrip();
};

startCamera();
