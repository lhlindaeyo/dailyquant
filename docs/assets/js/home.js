// 홈: config.homeKeywords의 가로칩 → 클릭 시 해당 .md fetch → marked 렌더
document.addEventListener("config:ready", () => {
  const cfg = window.APP.config || {};
  const chips = document.getElementById("home-chips");
  const body = document.getElementById("home-body");
  const keywords = cfg.homeKeywords || [];

  if (!keywords.length) {
    chips.innerHTML = "<p class='muted'>config.json에 homeKeywords를 추가하세요.</p>";
    body.innerHTML = "";
    return;
  }

  chips.innerHTML = "";
  keywords.forEach((kw, i) => {
    const chip = document.createElement("div");
    chip.className = "chip" + (i === 0 ? " active" : "");
    chip.innerHTML = `<div class="chip-title">${kw.name}</div>
                      <div class="chip-sub">${kw.sub || ""}</div>`;
    chip.addEventListener("click", () => {
      chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderKeyword(kw, body);
    });
    chips.appendChild(chip);
  });

  renderKeyword(keywords[0], body); // 첫 키워드 기본 표시
});

async function renderKeyword(kw, el) {
  el.innerHTML = "<p class='muted'>불러오는 중…</p>";
  try {
    const res = await fetch("./content/keywords/" + kw.file);
    if (!res.ok) throw new Error("not found");
    const md = await res.text();
    el.innerHTML = marked.parse(md);
  } catch (e) {
    el.innerHTML = `<p class='muted'>글이 아직 없어요. <code>docs/content/keywords/${kw.file}</code> 파일을 작성해 커밋하세요.</p>`;
  }
}
