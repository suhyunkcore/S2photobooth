function getCssFilter(filterName) {
  if (filterName === "filter1") {
    return "brightness(120%) contrast(100%) saturate(80%)";
  }

  if (filterName === "filter2") {
    return "sepia(10%) brightness(120%) contrast(115%) saturate(90%)";
  }

  if (filterName === "filter3") {
    return "brightness(110%) contrast(90%) saturate(67%) hue-rotate(-7deg)";
  }

  return "none";
}

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cameraScreen = document.getElementById("cameraScreen");
const resultScreen = document.getElementById("resultScreen");

const captureBtn = document.getElementById("captureBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const clearFilterBtn = document.getElementById("clearFilterBtn");
const backBtn = document.getElementById("backBtn");

const countdown = document.getElementById("countdown");
const photoCount = document.getElementById("photoCount");

const filterButtons = document.querySelectorAll(".filterBtn");
const frameButtons = document.querySelectorAll(".frameBtn");

let photos = [];
let selectedFilter = "filter1";
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

    video.style.filter = getCssFilter(selectedFilter);
  } catch (error) {
    alert("카메라 권한을 허용해주세요.");
    console.error(error);
  }
}

function getCssFilter(filterName) {
  if (filterName === "filter1") {
    return "brightness(130%) contrast(100%) saturate(80%) blur(0.3px)";
  }

  if (filterName === "filter2") {
    return "sepia(10%) brightness(130%) contrast(120%) saturate(90%)";
  }

  if (filterName === "filter3") {
    return "brightness(130%) contrast(100%) saturate(67%) hue-rotate(-7deg)";
  }

  return "none";
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
  tctx.translate(temp.width, 0);
  tctx.scale(-1, 1);
  drawImageCover(tctx, video, 0, 0, temp.width, temp.height);
  tctx.restore();

  applyPixelFilter(temp, selectedFilter);

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

function applyPixelFilter(canvas, filterName) {
  const c = canvas.getContext("2d");
  const imageData = c.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let brightness = 1;
  let contrast = 1;
  let saturation = 1;
  let sepia = 0;
  let hueRotate = 0;

  if (filterName === "filter1") {
    brightness = 1.3;
    contrast = 1;
    saturation = 0.8;
  }

  if (filterName === "filter2") {
    brightness = 1.3;
    contrast = 1.2;
    saturation = 0.9;
    sepia = 0.1;
  }

  if (filterName === "filter3") {
    brightness = 1.3;
    contrast = 1;
    saturation = 0.67;
    hueRotate = -7;
  }

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

    if (sepia > 0) {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;

      r = r * (1 - sepia) + sr * sepia;
      g = g * (1 - sepia) + sg * sepia;
      b = b * (1 - sepia) + sb * sepia;
    }

    if (hueRotate !== 0) {
      const angle = hueRotate * Math.PI / 180;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const nr =
        r * (0.213 + cosA * 0.787 - sinA * 0.213) +
        g * (0.715 - cosA * 0.715 - sinA * 0.715) +
        b * (0.072 - cosA * 0.072 + sinA * 0.928);

      const ng =
        r * (0.213 - cosA * 0.213 + sinA * 0.143) +
        g * (0.715 + cosA * 0.285 + sinA * 0.140) +
        b * (0.072 - cosA * 0.072 - sinA * 0.283);

      const nb =
        r * (0.213 - cosA * 0.213 - sinA * 0.787) +
        g * (0.715 - cosA * 0.715 + sinA * 0.715) +
        b * (0.072 + cosA * 0.928 + sinA * 0.072);

      r = nr;
      g = ng;
      b = nb;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  c.putImageData(imageData, 0, 0);
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

    video.style.filter = getCssFilter(selectedFilter);

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

  drawStrip();

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

clearFilterBtn.addEventListener("click", () => {
  selectedFilter = "none";
  video.style.filter = "none";

  filterButtons.forEach((btn) => {
    btn.classList.remove("selected");
  });
});
