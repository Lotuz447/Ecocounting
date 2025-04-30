let cardCount = 0;
const timers = [];

window.onload = function () {
  const productList = JSON.parse(localStorage.getItem("produk")) || [];
  productList.forEach((product, index) => {
    let sisa = product.remaining;

    if (product.startedAt) {
      const now = Date.now();
      const elapsed = Math.floor((now - product.startedAt) / 1000);
      sisa = Math.max(product.remaining - elapsed, 0);
    }

    tampilkanCard(product.image, product.timer, index, sisa);

    if (product.startedAt && sisa > 0) {
      timers[index].remaining = sisa;
      startCountdown(index);
    }
  });
};

function addCard() {
  const imageInput = document.getElementById("imageInput");
  const minutes = parseInt(document.getElementById("minutesInput").value || 0);
  const seconds = parseInt(document.getElementById("secondsInput").value || 0);
  const totalSeconds = minutes * 60 + seconds;

  if (!imageInput.files[0]) {
    alert("Silakan unggah gambar terlebih dahulu!");
    return;
  }

  if (totalSeconds <= 0) {
    alert("Masukkan waktu yang valid.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imgSrc = e.target.result;
    const productList = JSON.parse(localStorage.getItem("produk")) || [];

    productList.push({
      image: imgSrc,
      timer: totalSeconds,
      remaining: totalSeconds,
      startedAt: null
    });

    localStorage.setItem("produk", JSON.stringify(productList));
    tampilkanCard(imgSrc, totalSeconds, cardCount, totalSeconds);
  };
  reader.readAsDataURL(imageInput.files[0]);
}

function tampilkanCard(imgSrc, totalSeconds, index, remaining) {
  const timerId = `timer${index}`;
  const container = document.getElementById("cardContainer");

  const card = document.createElement("div");
  card.className = "card";
  card.id = `card${index}`;
  card.innerHTML = `
    <img src="${imgSrc}" alt="Makanan">
    <div class="timer" id="${timerId}">${formatTime(remaining)}</div>
    <div class="buttons">
      <button onclick="startCountdown(${index})">Mulai</button>
      <button onclick="stopCountdown(${index})">Stop</button>
      <button onclick="resetCountdown(${index}, ${totalSeconds})">Reset</button>
      <button onclick="deleteCountdown(${index})">Delete</button>
    </div>
  `;
  container.appendChild(card);

  timers[index] = {
    interval: null,
    remaining: remaining,
    original: totalSeconds,
    timerId: timerId
  };

  cardCount++;
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `00:${m}:${s}`;
}

function startCountdown(index) {
  const t = timers[index];
  if (!t || t.interval || t.remaining <= 0) return;

  t.startedAt = Date.now();
  updateStartedAtInStorage(index, t.startedAt);

  t.interval = setInterval(() => {
    if (t.remaining > 0) {
      t.remaining--;
      document.getElementById(t.timerId).textContent = formatTime(t.remaining);
      updateTimerInStorage(index, t.remaining);
    } else {
      clearInterval(t.interval);
      t.interval = null;
      updateStartedAtInStorage(index, null);

      // 🔊 Mainkan suara alarm
      const sound = document.getElementById("alarmSound");
      sound.play().catch(() => {
        console.log("Autoplay diblokir, klik user diperlukan untuk play.");
      });

      alert("Timer selesai!");
    }
  }, 1000);
}

function stopCountdown(index) {
  const t = timers[index];
  if (t && t.interval) {
    clearInterval(t.interval);
    t.interval = null;
    updateStartedAtInStorage(index, null);
    updateTimerInStorage(index, t.remaining);
  }
}

function resetCountdown(index, originalTime) {
  const t = timers[index];
  if (t) {
    clearInterval(t.interval);
    t.remaining = originalTime;
    document.getElementById(t.timerId).textContent = formatTime(t.remaining);
    t.interval = null;
    updateTimerInStorage(index, originalTime);
    updateStartedAtInStorage(index, null);
  }
}

function deleteCountdown(index) {
  const productList = JSON.parse(localStorage.getItem("produk")) || [];
  productList.splice(index, 1);
  localStorage.setItem("produk", JSON.stringify(productList));

  const card = document.getElementById(`card${index}`);
  if (card) card.remove();

  if (timers[index]?.interval) clearInterval(timers[index].interval);
  delete timers[index];

  document.getElementById("cardContainer").innerHTML = "";
  cardCount = 0;

  const updatedList = JSON.parse(localStorage.getItem("produk")) || [];
  updatedList.forEach((product, i) => {
    let sisa = product.remaining;

    if (product.startedAt) {
      const now = Date.now();
      const elapsed = Math.floor((now - product.startedAt) / 1000);
      sisa = Math.max(product.remaining - elapsed, 0);
    }

    tampilkanCard(product.image, product.timer, i, sisa);

    if (product.startedAt && sisa > 0) {
      timers[i].remaining = sisa;
      startCountdown(i);
    }
  });
}

function updateTimerInStorage(index, remainingTime) {
  const productList = JSON.parse(localStorage.getItem("produk")) || [];
  if (productList[index]) {
    productList[index].remaining = remainingTime;
    localStorage.setItem("produk", JSON.stringify(productList));
  }
}

function updateStartedAtInStorage(index, timestamp) {
  const productList = JSON.parse(localStorage.getItem("produk")) || [];
  if (productList[index]) {
    productList[index].startedAt = timestamp;
    localStorage.setItem("produk", JSON.stringify(productList));
  }
}
