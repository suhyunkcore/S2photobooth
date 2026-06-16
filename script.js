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
frameImage.src = selectedFrame + "?v=" + new Date().getTime();

// 카메라 시작
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

// 비율 안 찌그러지게 그리기
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

// 네컷 결과 그리기
function drawStrip() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  photos.forEach((photo, index) => {
    const y = 120 + index * 375;

    ctx.save();
    ctx.filter = selectedFilter;
    ctx.drawImage(photo, 50, y, 500, 340);
    ctx.restore();
  });

  if (frameImage.complete) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }
}

// 사진 촬영
function takePhoto() {
  const temp = document.createElement("canvas");
  temp.width = 500;
  temp.height = 340;

  const tctx = temp.getContext("2d");

  tctx.save();
  tctx.translate(temp.width, 0);
  tctx.scale(-1, 1);

  drawImageCover(tctx, video, 0, 0, temp.width, temp.height);

  tctx.restore();

  applyCanvasFilter(temp, selectedFilter);

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

function applyCanvasFilter(canvas, filter) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let brightness = 1;
  let contrast = 1;
  let saturation = 1;
  let sepia = 0;
  let grayscale = 0;

  const getValue = (name, defaultValue) => {
    const match = filter.match(new RegExp(name + "\\((\\d+)%\\)"));
    return match ? Number(match[1]) / 100 : defaultValue;
  };

  brightness = getValue("brightness", 1);
  contrast = getValue("contrast", 1);
  saturation = getValue("saturate", 1);
  sepia = getValue("sepia", 0);
  grayscale = getValue("grayscale", 0);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r *= brightness;
    g *= brightness;
    b *= brightness;

    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;

    if (grayscale > 0) {
      r = r * (1 - grayscale) + gray * grayscale;
      g = g * (1 - grayscale) + gray * grayscale;
      b = b * (1 - grayscale) + gray * grayscale;
    }

    if (sepia > 0) {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;

      r = r * (1 - sepia) + sr * sepia;
      g = g * (1 - sepia) + sg * sepia;
      b = b * (1 - sepia) + sb * sepia;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
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

// 다시 찍기
resetBtn.addEventListener("click", () => {
  photos = [];
  photoCount.innerText = "0 / 4";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 필터 버튼
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedFilter = button.dataset.filter;

    // 실시간 카메라에도 필터 적용
    video.style.filter = selectedFilter;

    filterButtons.forEach((btn) => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");
  });
});

// 프레임 선택
frameButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedFrame = button.dataset.frame;

    frameImage = new Image();
    frameImage.src = selectedFrame + "?v=" + new Date().getTime();

    frameImage.onload = () => {
      drawStrip();
    };
  });
});

// 저장하기
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

// 다시 촬영하기
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
