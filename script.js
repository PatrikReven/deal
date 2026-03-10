const MONEY_10 = [0.5, 1, 5, 10, 25, 50, 100, 500, 1000, 10000];

const $ = (id) => document.getElementById(id);

const ui = {
  btnNew: $("btnNew"),
  btnHelp: $("btnHelp"),
  grid: $("grid"),
  prizeListLeft: $("prizeListLeft"),
  prizeListRight: $("prizeListRight"),

  openedCount: $("openedCount"),
  leftCount: $("leftCount"),
  phase: $("phase"),
  hint: $("hint"),
  badge: $("badge"),

  yourNum: $("yourNum"),

  toast: $("toast"),

  helpBack: $("helpBack"),
  helpModal: $("helpModal"),

  overlay: $("overlay"),
  ovTitle: $("ovTitle"),
  ovClose: $("ovClose"),
  ovGo: $("ovGo"),
  ovText: $("ovText"),
  ovLine: $("ovLine"),
  ovMini: $("ovMini"),
  bigGift: $("bigGift"),
  sparkles: $("sparkles"),

  endBack: $("endBack"),
  endModal: $("endModal"),
  endMoney: $("endMoney"),
  endLine: $("endLine"),
  btnAgain: $("btnAgain"),
};

let state = null;
let busy = false;

function sleep(ms){
  return new Promise((r) => setTimeout(r, ms));
}

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtEUR(x){
  if (x < 1) return `${Math.round(x * 100)}c`;
  return x.toLocaleString("sl-SI", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });
}

function toast(msg){
  ui.toast.textContent = msg;
  ui.toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => ui.toast.classList.remove("show"), 1300);
}

function getOpenedSet(){
  return new Set(state ? state.openedValues.map(String) : []);
}

function renderPrizePanels(){
  const all = MONEY_10.slice().sort((a, b) => a - b);
  const left = all.slice(0, 5);
  const right = all.slice(5);

  const openedSet = getOpenedSet();

  ui.prizeListLeft.innerHTML = "";
  ui.prizeListRight.innerHTML = "";

  for (const value of left){
    const row = document.createElement("div");
    row.className = "prizeRow";
    if (openedSet.has(String(value))) row.classList.add("out");

    const val = document.createElement("div");
    val.className = "prizeVal";
    val.textContent = fmtEUR(value);

    const label = document.createElement("div");
    label.className = "prizeLabel";
    label.textContent = "NAGRADA";

    row.append(val, label);
    ui.prizeListLeft.appendChild(row);
  }

  for (const value of right){
    const row = document.createElement("div");
    row.className = "prizeRow";
    if (openedSet.has(String(value))) row.classList.add("out");

    const val = document.createElement("div");
    val.className = "prizeVal";
    val.textContent = fmtEUR(value);

    const label = document.createElement("div");
    label.className = "prizeLabel";
    label.textContent = "NAGRADA";

    row.append(val, label);
    ui.prizeListRight.appendChild(row);
  }
}

function openHelp(){
  ui.helpBack.classList.add("show");
  ui.helpModal.classList.add("show");
  ui.helpBack.setAttribute("aria-hidden", "false");
  ui.helpModal.setAttribute("aria-hidden", "false");
}

function closeHelp(){
  ui.helpBack.classList.remove("show");
  ui.helpModal.classList.remove("show");
  ui.helpBack.setAttribute("aria-hidden", "true");
  ui.helpModal.setAttribute("aria-hidden", "true");
}

function openEnd(){
  ui.endBack.classList.add("show");
  ui.endModal.classList.add("show");
  ui.endBack.setAttribute("aria-hidden", "false");
  ui.endModal.setAttribute("aria-hidden", "false");
}

function closeEnd(){
  ui.endBack.classList.remove("show");
  ui.endModal.classList.remove("show");
  ui.endBack.setAttribute("aria-hidden", "true");
  ui.endModal.setAttribute("aria-hidden", "true");
}

function openOverlay(){
  ui.overlay.classList.add("show");
  ui.overlay.setAttribute("aria-hidden", "false");
}

function closeOverlay(){
  ui.overlay.classList.remove("show");
  ui.overlay.setAttribute("aria-hidden", "true");
}

function clearSparkles(){
  ui.sparkles.innerHTML = "";
  ui.bigGift.classList.remove("sparkle");
}

function spawnSparkles(count = 16){
  clearSparkles();
  ui.bigGift.classList.add("sparkle");

  const w = ui.bigGift.clientWidth;
  const h = ui.bigGift.clientHeight;

  for (let i = 0; i < count; i++){
    const s = document.createElement("div");
    s.className = "spark";

    const x = Math.random() * w * 0.6 + w * 0.2;
    const y = Math.random() * h * 0.35 + h * 0.25;

    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 220}px`);
    s.style.setProperty("--dy", `${-Math.random() * 260 - 60}px`);

    ui.sparkles.appendChild(s);
  }

  setTimeout(clearSparkles, 950);
}

async function showReveal({ title, line, moneyText, mini, dramatic = false }){
  ui.ovTitle.textContent = title;
  ui.ovLine.textContent = line;
  ui.ovMini.textContent = mini || "Klikni Nadaljuj.";
  ui.ovText.textContent = "—";
  ui.ovText.classList.remove("show");
  ui.ovGo.disabled = true;

  ui.bigGift.classList.remove("open");
  clearSparkles();

  openOverlay();

  await sleep(120);
  ui.bigGift.classList.add("open");

  await sleep(dramatic ? 1400 : 650);

  spawnSparkles(dramatic ? 24 : 16);
  ui.ovText.textContent = moneyText;
  ui.ovText.classList.add("show");
  ui.ovGo.disabled = false;

  await new Promise((resolve) => {
    const done = () => {
      ui.ovGo.removeEventListener("click", done);
      ui.ovClose.removeEventListener("click", done);
      ui.overlay.removeEventListener("click", backdrop);
      resolve();
    };

    const backdrop = (e) => {
      if (e.target === ui.overlay) done();
    };

    ui.ovGo.addEventListener("click", done);
    ui.ovClose.addEventListener("click", done);
    ui.overlay.addEventListener("click", backdrop);
  });

  closeOverlay();
}

function setPhase(text, hint){
  ui.phase.textContent = text;
  ui.hint.textContent = hint;
}

function newGame(){
  const values = shuffle(MONEY_10);
  const ids = Array.from({ length: 10 }, (_, i) => i + 1);

  const cases = ids.map((id, idx) => ({
    id,
    value: values[idx],
    opened: false,
    isPlayer: false
  }));

  state = {
    cases,
    phase: "pick",
    playerId: null,
    openedValues: []
  };

  busy = false;

  ui.yourNum.textContent = "—";
  ui.openedCount.textContent = "0";
  ui.leftCount.textContent = "10";
  ui.badge.textContent = "10 škatel";

  setPhase("Izberi svojo škatlo", "Klikni eno škatlo spodaj, da postane tvoja.");
  render();
  toast("Nova igra ✨");
}

function render(){
  const opened = state.cases.filter((c) => c.opened).length;
  ui.openedCount.textContent = String(opened);
  ui.leftCount.textContent = String(10 - opened);

  renderPrizePanels();

  ui.grid.innerHTML = "";

  for (const c of state.cases){
    const btn = document.createElement("button");
    btn.className = "case";
    btn.type = "button";

    if (state.phase === "pick" && !state.playerId) btn.classList.add("pulse");
    if (c.isPlayer) btn.classList.add("chosen");
    if (c.opened) btn.classList.add("opened");

    btn.disabled = busy || state.phase === "ended" || c.opened;
    if (state.phase !== "pick" && c.isPlayer) btn.disabled = true;

    const gift = document.createElement("div");
    gift.className = "gift";

    const lid = document.createElement("div");
    lid.className = "lid";

    const box = document.createElement("div");
    box.className = "box";

    const ribbon = document.createElement("div");
    ribbon.className = "ribbon";

    const num = document.createElement("div");
    num.className = "caseNum";
    num.textContent = String(c.id);

    const money = document.createElement("div");
    money.className = "caseMoney";
    money.textContent = c.opened ? fmtEUR(c.value) : "—";

    gift.append(lid, box, ribbon, num, money);
    btn.appendChild(gift);

    btn.addEventListener("click", () => onCaseClick(c.id, btn));
    ui.grid.appendChild(btn);
  }
}

async function onCaseClick(id, btnEl){
  if (busy) return;

  const c = state.cases.find((x) => x.id === id);
  if (!c || c.opened) return;

  if (state.phase === "pick"){
    state.playerId = id;
    c.isPlayer = true;
    state.phase = "open";

    ui.yourNum.textContent = String(id);

    setPhase("Odpiraj škatle", "Klikaj ostale škatle. Na koncu se razkrije tvoja.");
    toast(`Tvoja škatla: #${id} ✅`);
    render();
    return;
  }

  if (state.phase === "open"){
    if (c.isPlayer) return;

    busy = true;

    btnEl.classList.add("opening");
    await sleep(560);

    await showReveal({
      title: "Odpiranje škatle…",
      line: `Škatla #${c.id}`,
      moneyText: fmtEUR(c.value),
      mini: "To je bilo notri.",
      dramatic: false
    });

    c.opened = true;
    state.openedValues.push(c.value);

    busy = false;
    render();

    const left = state.cases.filter((x) => !x.opened);
    if (left.length === 1 && left[0].isPlayer){
      await endGame();
    }
  }
}

async function endGame(){
  state.phase = "ended";
  render();

  const player = state.cases.find((c) => c.isPlayer);
  const val = player.value;

  setPhase("Konec", "Zdaj se razkrije tvoja škatla…");
  toast("Finale… 👀");

  await showReveal({
    title: "FINALNA ŠKATLA…",
    line: `Tvoja škatla #${player.id}`,
    moneyText: "…",
    mini: "Drumroll…",
    dramatic: true
  });

  await showReveal({
    title: "RAZKRITJE!",
    line: `Tvoja škatla #${player.id} je imela:`,
    moneyText: fmtEUR(val),
    mini: "Klikni Nadaljuj.",
    dramatic: true
  });

  confettiBoom();

  ui.endMoney.textContent = fmtEUR(val);
  ui.endLine.textContent = `Tvoja škatla je bila #${player.id}.`;
  openEnd();
}

function confettiBoom(){
  const colors = [
    "rgba(230,73,255,.95)",
    "rgba(91,199,255,.95)",
    "rgba(255,200,87,.95)",
    "rgba(51,214,159,.95)",
    "rgba(255,255,255,.9)"
  ];

  const pieces = 90;
  const w = window.innerWidth;

  for (let i = 0; i < pieces; i++){
    const d = document.createElement("div");
    d.className = "confetti";
    d.style.left = Math.round(Math.random() * w) + "px";
    d.style.background = colors[Math.floor(Math.random() * colors.length)];
    d.style.transform = `rotate(${Math.random() * 180}deg)`;
    document.body.appendChild(d);

    const duration = 1200 + Math.random() * 900;
    const xDrift = (Math.random() * 2 - 1) * 160;
    const rot = (Math.random() * 2 - 1) * 260;
    const start = performance.now();

    const startX = parseFloat(d.style.left);
    const startY = -20;
    const endY = window.innerHeight + 30;

    function tick(t){
      const p = Math.min(1, (t - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);

      const x = startX + xDrift * ease;
      const y = startY + (endY - startY) * ease;

      d.style.left = x + "px";
      d.style.top = y + "px";
      d.style.transform = `rotate(${rot * ease}deg)`;
      d.style.opacity = String(1 - p * 0.85);

      if (p < 1) requestAnimationFrame(tick);
      else d.remove();
    }

    requestAnimationFrame(tick);
  }
}

function wire(){
  ui.btnNew.addEventListener("click", newGame);
  ui.btnHelp.addEventListener("click", openHelp);

  ui.helpBack.addEventListener("click", closeHelp);
  ui.endBack.addEventListener("click", closeEnd);

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-close]");
    if (!b) return;

    const which = b.getAttribute("data-close");
    if (which === "help") closeHelp();
    if (which === "end") closeEnd();
  });

  ui.btnAgain.addEventListener("click", () => {
    closeEnd();
    newGame();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape"){
      closeHelp();
      closeEnd();
      if (ui.overlay.classList.contains("show")) closeOverlay();
    }
  });
}

wire();
newGame();