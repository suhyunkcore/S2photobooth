const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const captureBtn = document.getElementById("captureBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const filterSelect = document.getElementById("filterSelect");
const countdown = document.getElementById("countdown");

let photos = [];

// 카메라 시작
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
  } catch (error) {
    alert("카메라를 사용할 수 없습니다. 카메라 권한을 허용해주세요.");
    console.error(error);
  }
}

// 사진 비율이 찌그러지지 않게 가운데 기준으로 자르기
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

// 4컷 포토부스 그리기
function drawStrip() {
  ctx.fillStyle = "#f8eadc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fffaf5";
  ctx.fillRect(35, 35, 530, 1730);

  ctx.strokeStyle = "#7a4a2a";
  ctx.lineWidth = 6;
  ctx.strokeRect(35, 35, 530, 1730);

  ctx.fillStyle = "#7a4a2a";
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText("MY PHOTO BOOTH", 300, 75);

  photos.forEach((photo, index) => {
    const y = 120 + index * 375;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(45, y - 10, 510, 360);

    ctx.drawImage(photo, 50, y, 500, 340);

    ctx.strokeStyle = "#d8b89a";
    ctx.lineWidth = 4;
    ctx.strokeRect(50, y, 500, 340);
  });

  ctx.fillStyle = "#7a4a2a";
  ctx.font = "24px Arial";
  ctx.fillText("♡ " + new Date().toLocaleDateString() + " ♡", 300, 1685);

  ctx.font = "22px Arial";
  ctx.fillText("Faded Memories", 300, 1725);
}

// 사진 촬영
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

// 촬영 버튼
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

// 저장 버튼
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

// 다시찍기 버튼
resetBtn.addEventListener("click", () => {
  photos = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 실행
startCamera();
