// 홈: 카테고리별(시황/매크로/주주일지) 폴더의 .md 글들을
// GitHub API로 자동 나열 → 날짜 최신순 '일기 피드'로 렌더.
// 새 글 추가법: 해당 폴더에 2026-08-18.md 처럼 날짜 파일을 만들어 커밋하면 끝(등록 불필요).
document.addEventListener("config:ready", () => {
  const cfg = window.APP.config || {};
  const chips = document.getElementById("home-chips");
  const body = document.getElementById("home-body");
  const cats = cfg.homeKeywords || [];

  if (!cats.length) {
    chips.innerHTML = "<p class='muted'>config.json에 homeKeywords를 추가하세요.</p>";
    body.innerHTML = "";
    return;
  }

  chips.innerHTML = "";
  cats.forEach((cat, i) => {
    const chip = document.createElement("div");
    chip.className = "chip" + (i === 0 ? " active" : "");
    chip.innerHTML = `<div class="chip-title">${cat.name}</div>
                      <div class="chip-sub">${cat.sub || ""}</div>`;
    chip.addEventListener("click", () => {
      chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderCategory(cat, body);
    });
    chips.appendChild(chip);
  });

  renderCategory(cats[0], body); // 첫 카테고리 기본 표시
});

function ghInfo(cfg) {
  const g = cfg.github || {};
  return {
    owner: g.owner,
    name: g.name,
    branch: g.branch || "main",
    base: g.contentBase || "docs/content/home",
  };
}

async function renderCategory(cat, el) {
  el.innerHTML = "<p class='muted'>불러오는 중…</p>";
  const cfg = window.APP.config || {};
  const g = ghInfo(cfg);
  const dirPath = `${g.base}/${cat.dir}`;
  const api = `https://api.github.com/repos/${g.owner}/${g.name}/contents/${dirPath}?ref=${g.branch}`;

  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error("GitHub API " + res.status);
    const items = await res.json();
    if (!Array.isArray(items)) throw new Error("폴더가 아님");

    const posts = items
      .filter((f) => f.type === "file" && /\.md$/i.test(f.name))
      .sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0)); // 날짜 최신순

    if (!posts.length) {
      el.innerHTML = emptyMsg(cat);
      return;
    }

    const cards = await Promise.all(
      posts.map(async (p) => {
        let md = "";
        try {
          const r = await fetch(p.download_url);
          md = await r.text();
        } catch (e) {
          md = "*(글을 불러오지 못했어요)*";
        }
        return postCard(p.name, md);
      })
    );
    el.innerHTML = cards.join("");
  } catch (e) {
    el.innerHTML = emptyMsg(cat, e.message);
  }
}

function postCard(filename, md) {
  const title = filename.replace(/\.md$/i, "");
  return `<article class="post-card">
    <div class="post-date">${title}</div>
    <div class="markdown">${marked.parse(md)}</div>
  </article>`;
}

function emptyMsg(cat, err) {
  return `<article class="post-card">
    <p class='muted'>아직 글이 없어요. <code>docs/content/home/${cat.dir}/</code> 폴더에
    <code>2026-08-18.md</code> 처럼 날짜 파일을 만들어 커밋하면 이 자리에 최신순으로 쌓여요.
    ${err ? `<br><span class='muted'>(${err})</span>` : ""}</p>
  </article>`;
}
