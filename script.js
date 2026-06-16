const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const captureBtn = document.getElementById("captureBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const filterSelect = document.getElementById("filterSelect");
const countdown = document.getElementById("countdown");

let photos = [];

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });
  video.srcObject = stream;
}

function drawStrip() {
  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#4b2e1f";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PHOTO BOOTH", 300, 50);

  photos.forEach((photo, index) => {
    ctx.drawImage(photo, 50, 90 + index * 390, 500, 340);
  });

  ctx.font = "24px Arial";
  ctx.fillText(new Date().toLocaleDateString(), 300, 1700);
}

function takePhoto() {
  const temp = document.createElement("canvas");
  temp.width = 500;
  temp.height = 340;

  const tctx = temp.getContext("2d");
  tctx.translate(temp.width, 0);
  tctx.scale(-1, 1);
  tctx.filter = filterSelect.value;
  tctx.drawImage(video, 0, 0, temp.width, temp.height);

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
  const link = document.createElement("a");
  link.download = "my-photobooth.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

resetBtn.addEventListener("click", () => {
  photos = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

startCamera();
