const STORAGE_KEY = "xiaoyu-campus-opportunities-v1";

const seedOpportunities = [
  { id: "bridge-camp", title: "“蓝桥杯”程序设计校内训练营", category: "学习", source: "学校", status: "报名中", time: "9月21日 19:30 起", location: "实验楼 A402", capacity: "零基础可参加", contact: "校内训练营报名入口", description: "每周六 19:00 训练。原计划已因场地调整更新为首次 9 月 21 日 19:30，请以本条补充信息为准。", updated: true },
  { id: "ai-class", title: "AI应用入门公开课", category: "学习", source: "学院", status: "即将开始", time: "9月19日 19:00", location: "计算机学院教学楼", capacity: "预计 90 分钟", contact: "无需报名", description: "面向全校学生的 AI 应用入门公开课，无需提前报名。" },
  { id: "startup-team", title: "大学生创新创业项目团队招募", category: "招募", source: "学校", status: "报名中", time: "9月22日 18:00 截止", location: "线上投递", capacity: "开发、设计、材料成员", contact: "提交简短自我介绍", description: "每周需稳定投入 4 小时以上。开发方向名额已满，目前主要补充设计与材料成员。", updated: true },
  { id: "volunteer", title: "校园公益志愿服务活动", category: "活动", source: "学校", status: "即将截止", time: "9月27日 8:30—17:00", location: "待通知", capacity: "预计服务 8 小时", contact: "9月20日 12:00 前报名", description: "需要提前到场签到；适合希望参与校内公益服务的同学。" },
  { id: "ai-challenge", title: "AI创新应用挑战赛", category: "比赛", source: "学院", status: "报名中", time: "9月21日 18:00 前", location: "校内意向登记", capacity: "2—4 人组队", contact: "赛事意向登记入口", description: "意向登记不等同于最终作品提交，正式作品提交截止到 10 月 20 日。" },
  { id: "git-workshop", title: "Git与GitHub零基础工作坊", category: "学习", source: "学院", status: "报名中", time: "9月21日 19:00—20:30", location: "待审核通知", capacity: "限 40 人", contact: "提前预约", description: "主要面向大一新生。提交报名表不代表最终录取，请等待审核通知。" },
  { id: "badminton", title: "周末羽毛球约球", category: "活动", source: "学生", status: "待确认", time: "9月20日 16:00", location: "场地待最终确认", capacity: "计划 6—8 人", contact: "在小程序内留言", description: "学生个人发起，费用 AA。场地尚未确认，建议参与前先留言核实。" },
  { id: "study-buddy", title: "AI工具交流搭子招募", category: "招募", source: "学生", status: "待确认", time: "9月21日晚上", location: "地点未确定", capacity: "欢迎零基础", contact: "报名后拉群", description: "学生个人发起的 AI 工具交流活动，地点将在成团后确认。" },
  { id: "research", title: "科研助理招募", category: "招募", source: "学院", status: "即将截止", time: "9月21日截止", location: "线上报名", capacity: "仅限大二及以上", contact: "招募说明页", description: "协助数据整理和实验工作，每周预计投入 6 小时。" },
  { id: "language", title: "外国语学院校园语言角", category: "活动", source: "学院", status: "报名中", time: "9月21日 15:00", location: "场地容量有限", capacity: "面向全校学生", contact: "无需提前报名", description: "自由交流形式的语言角活动，建议尽早到场。" }
];

let state = loadState();
let activeCategory = "全部";
let activeSource = "全部";
let selectedId = null;
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      user: saved?.user ?? null,
      favorites: saved?.favorites ?? [],
      interested: saved?.interested ?? [],
      published: saved?.published ?? []
    };
  } catch {
    return { user: null, favorites: [], interested: [], published: [] };
  }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function allOpportunities() { return [...state.published, ...seedOpportunities]; }
function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", "\"": "&quot;" }[char])); }
function initials(name) { return name ? [...name].slice(0, 1).join("") : "访"; }

function sourceClass(source) { return ({ "学校": "school", "学院": "college", "学生": "student" })[source] ?? "student"; }
function statusClass(status) {
  if (status.includes("结束")) return "ended";
  if (status.includes("截止")) return "soon";
  if (status.includes("确认")) return "pending";
  if (status.includes("风险")) return "risk";
  return "open";
}

function renderFilters() {
  const categories = ["全部", "活动", "学习", "招募", "比赛"];
  const sources = ["全部", "学校", "学院", "学生"];
  $("#categoryFilters").innerHTML = categories.map((item) => `<button class="filter-chip ${activeCategory === item ? "is-selected" : ""}" data-category="${item}">${item}</button>`).join("");
  $("#sourceFilters").innerHTML = sources.map((item) => `<button class="filter-chip ${activeSource === item ? "is-selected" : ""}" data-source="${item}">${item === "全部" ? "全部来源" : item + "发布"}</button>`).join("");
}

function renderOpportunities() {
  const keyword = $("#searchInput").value.trim().toLowerCase();
  const items = allOpportunities().filter((item) => {
    const haystack = `${item.title} ${item.category} ${item.source} ${item.description} ${item.location}`.toLowerCase();
    return (activeCategory === "全部" || item.category === activeCategory)
      && (activeSource === "全部" || item.source === activeSource)
      && (!keyword || haystack.includes(keyword));
  });
  $("#resultCount").textContent = `共 ${items.length} 条`;
  $("#opportunityList").innerHTML = items.map((item) => `
    <button class="opportunity-card" data-detail-id="${item.id}">
      <span class="card-meta">
        <span class="tag ${sourceClass(item.source)}">${escapeHtml(item.source)}发布</span>
        <span class="tag">${escapeHtml(item.category)}</span>
        <span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <span class="card-footer"><span>◷ ${escapeHtml(item.time)}</span><span>⌖ ${escapeHtml(item.location)}</span></span>
    </button>`).join("");
  $("#discoverEmpty").classList.toggle("hidden", items.length > 0);
  $("#insightNotice").innerHTML = "<strong>使用提示：</strong> 信息状态来自题目材料；标为“待确认”的学生信息请先联系发布者，补充通知会在详情中明确标注。";
}

function renderHeader() {
  const name = state.user?.name ?? "访客";
  $("#headerUserName").textContent = name;
  $("#headerAvatar").textContent = initials(name);
}

function renderPublishHint() {
  $("#publishBindingHint").innerHTML = state.user
    ? `<div class="hint-card"><span>将以 <strong>${escapeHtml(state.user.name)}</strong> 的身份发布。发布后内容会保存到当前浏览器。</span><button class="text-button" id="switchUser">切换身份</button></div>`
    : `<div class="hint-card"><span><strong>发布前需要先绑定昵称。</strong> 这样其他同学能识别发布者，并能在“我的”中管理内容。</span><button class="text-button" id="bindFromPublish">去绑定</button></div>`;
}

function renderProfile() {
  const root = $("#profileContent");
  if (!state.user) {
    root.innerHTML = `<div class="profile-empty"><span class="profile-avatar">访</span><h2>还没有绑定身份</h2><p>绑定一个昵称后，就可以发布校园信息、收藏活动，并管理自己的校园清单。</p><button class="primary-button" id="bindFromProfile">绑定微信昵称</button></div>`;
    return;
  }
  const favoriteItems = allOpportunities().filter((item) => state.favorites.includes(item.id));
  const publishedItems = state.published;
  root.innerHTML = `
    <div class="profile-card">
      <span class="profile-avatar">${escapeHtml(initials(state.user.name))}</span>
      <div><h2>${escapeHtml(state.user.name)}</h2><p>${escapeHtml(state.user.identity || "已绑定校园身份")}</p></div>
      <button class="text-button" id="rebindUser">重新绑定</button>
    </div>
    <div class="profile-section"><h3>我收藏的机会 <span class="result-count">${favoriteItems.length}</span></h3>${renderMiniList(favoriteItems, "查看")}</div>
    <div class="profile-section"><h3>我发布的信息 <span class="result-count">${publishedItems.length}</span></h3>${renderMiniList(publishedItems, "查看")}</div>`;
}

function renderMiniList(items, action) {
  if (!items.length) return "<p class=\"result-count\">暂时没有内容，去发现页看看吧。</p>";
  return `<div class="mini-list">${items.map((item) => `<div class="mini-item"><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.status)} · ${escapeHtml(item.time)}</span></div><button class="text-button" data-detail-id="${item.id}">${action}</button></div>`).join("")}</div>`;
}

function showView(view) {
  $$(".view").forEach((element) => element.classList.toggle("is-active", element.id === `${view}View`));
  $$(".nav-item").forEach((element) => element.classList.toggle("is-active", element.dataset.view === view));
  if (view === "profile") renderProfile();
  if (view === "publish") renderPublishHint();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openBindDialog() {
  const dialog = $("#bindDialog");
  dialog.querySelector("input[name=name]").value = state.user?.name ?? "";
  dialog.querySelector("input[name=identity]").value = state.user?.identity ?? "";
  dialog.showModal();
}

function openDetail(id) {
  const item = allOpportunities().find((candidate) => candidate.id === id);
  if (!item) return;
  selectedId = id;
  const isFavorite = state.favorites.includes(id);
  const isInterested = state.interested.includes(id);
  $("#detailContent").innerHTML = `
    <div class="detail-meta"><span class="tag ${sourceClass(item.source)}">${escapeHtml(item.source)}发布</span><span class="tag">${escapeHtml(item.category)}</span><span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div>
    <h2>${escapeHtml(item.title)}</h2>
    <p class="description">${escapeHtml(item.description)}</p>
    <div class="detail-facts">
      <div class="fact"><span>时间</span><strong>${escapeHtml(item.time)}</strong></div>
      <div class="fact"><span>地点</span><strong>${escapeHtml(item.location)}</strong></div>
      <div class="fact"><span>人数或条件</span><strong>${escapeHtml(item.capacity || "以发布信息为准")}</strong></div>
      <div class="fact"><span>参与方式</span><strong>${escapeHtml(item.contact)}</strong></div>
    </div>
    ${item.updated ? "<div class=\"notice\"><strong>已更新：</strong> 该信息包含补充或变更内容，展示时已优先采用最新说明。</div>" : ""}
    <div class="detail-actions"><button class="primary-button" id="interestButton">${isInterested ? "已标记感兴趣" : "标记感兴趣"}</button><button class="secondary-button" id="favoriteButton">${isFavorite ? "已收藏" : "收藏"}</button></div>`;
  $("#detailDialog").showModal();
}

function requireUser() {
  if (state.user) return true;
  showToast("请先绑定昵称，再保存你的操作");
  if ($("#detailDialog").open) $("#detailDialog").close();
  openBindDialog();
  return false;
}

function toggleSaved(listName, id, message) {
  if (!requireUser()) return;
  const list = state[listName];
  const index = list.indexOf(id);
  if (index >= 0) { list.splice(index, 1); showToast("已取消" + message); }
  else { list.push(id); showToast("已" + message); }
  saveState(); renderProfile(); openDetail(id);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function dateInputToText(value) {
  if (!value) return "时间待确认";
  const date = new Date(value);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function bindEvents() {
  $("#searchInput").addEventListener("input", renderOpportunities);
  $("#categoryFilters").addEventListener("click", (event) => { const button = event.target.closest("[data-category]"); if (!button) return; activeCategory = button.dataset.category; renderFilters(); renderOpportunities(); });
  $("#sourceFilters").addEventListener("click", (event) => { const button = event.target.closest("[data-source]"); if (!button) return; activeSource = button.dataset.source; renderFilters(); renderOpportunities(); });
  $("#clearFilters").addEventListener("click", () => { activeCategory = "全部"; activeSource = "全部"; $("#searchInput").value = ""; renderFilters(); renderOpportunities(); });
  $("#opportunityList").addEventListener("click", (event) => { const card = event.target.closest("[data-detail-id]"); if (card) openDetail(card.dataset.detailId); });
  $$("[data-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
  $("#userTrigger").addEventListener("click", () => showView("profile"));
  $("#closeDetail").addEventListener("click", () => $("#detailDialog").close());
  $("#closeBind").addEventListener("click", () => $("#bindDialog").close());
  $("#detailContent").addEventListener("click", (event) => { if (event.target.id === "favoriteButton") toggleSaved("favorites", selectedId, "收藏"); if (event.target.id === "interestButton") toggleSaved("interested", selectedId, "标记为感兴趣"); });
  $("#profileContent").addEventListener("click", (event) => { if (event.target.closest("#bindFromProfile") || event.target.closest("#rebindUser")) openBindDialog(); const item = event.target.closest("[data-detail-id]"); if (item) openDetail(item.dataset.detailId); });
  $("#publishBindingHint").addEventListener("click", (event) => { if (event.target.closest("#bindFromPublish") || event.target.closest("#switchUser")) openBindDialog(); });
  $("#bindForm").addEventListener("submit", (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); state.user = { name: form.get("name").trim(), identity: form.get("identity").trim() }; saveState(); renderHeader(); renderPublishHint(); renderProfile(); $("#bindDialog").close(); showToast("身份绑定成功"); });
  $("#publishForm").addEventListener("submit", (event) => { event.preventDefault(); if (!requireUser()) return; const form = new FormData(event.currentTarget); const item = { id: `user-${Date.now()}`, title: form.get("title").trim(), category: form.get("category"), source: "学生", status: "待确认", time: dateInputToText(form.get("time")), location: form.get("location").trim(), capacity: form.get("capacity").trim() || "人数待确认", contact: form.get("contact").trim(), description: form.get("description").trim(), author: state.user.name }; state.published.unshift(item); saveState(); event.currentTarget.reset(); renderOpportunities(); renderProfile(); showView("discover"); showToast("发布成功，已进入信息流"); });
}

function init() { renderFilters(); renderOpportunities(); renderHeader(); renderPublishHint(); renderProfile(); bindEvents(); }
init();
