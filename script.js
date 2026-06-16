const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const captureBtn = document.getElementById("captureBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const filterSelect = document.getElementById("filterSelect");
const countdown = document.getElementById("countdown");

let photos = [];

const frameImage = new Image();
frameImage.src = "frame.png";

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    video.srcObject = stream;
  } catch (error) {
    alert("카메라 권한을 허용해주세요.");
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

function drawStrip() {
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

function takePhoto() {
  const temp = document.createElement("canvas");
  temp.width = 500;
  temp.height = 340;

  const tctx = temp.getContext("2d");

  tctx.translate(temp.width, 0);
  tctx.scale(-1, 1);
  tctx.filter = filterSelect.value;

  drawImageCover(tctx, video, 0, 0, temp.width, temp.height);

  photos.push(temp);
  drawStrip();
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

resetBtn.addEventListener("click", () => {
  photos = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

frameImage.onload = () => {
  drawStrip();
};

startCamera();
