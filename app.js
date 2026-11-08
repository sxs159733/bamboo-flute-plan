(function (global) {
  'use strict';

  const COURSE_DATA = global.COURSE || (typeof require === 'function' ? require('./data.js') : null);
  if (!COURSE_DATA) throw new Error('课程数据未加载');

  const STORAGE_KEY = 'zhudi-study-v1';
  const LESSONS = COURSE_DATA.lessons;
  const LESSON_MAP = new Map(LESSONS.map(function (l) { return [l.id, l]; }));
  const STAGES = COURSE_DATA.stages;
  const WEEK_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const DOC_CSS = [
    '@page { size: A4; margin: 16mm 15mm; }',
    'body { font-family: "SimSun","Songti SC",serif; font-size: 11.5pt; line-height: 1.75; color: #1E2822; margin: 0; }',
    '.doc { max-width: 100%; }',
    'h1 { font-size: 22pt; margin: 0 0 4pt; letter-spacing: 3pt; color: #1F4A36; }',
    '.doc-sub { color: #5C665E; font-size: 10.5pt; margin: 0 0 16pt; }',
    'h2 { font-size: 15pt; margin: 22pt 0 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #2F6B4E; color: #1F4A36; }',
    'h3 { font-size: 12pt; margin: 14pt 0 5pt; color: #26362C; }',
    'p { margin: 0 0 7pt; }',
    '.meta { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt; }',
    '.meta td { border: 1pt solid #BBB3A2; padding: 4pt 7pt; font-size: 10pt; }',
    'table { width: 100%; border-collapse: collapse; margin: 6pt 0 12pt; }',
    'th, td { border: 1pt solid #A8A091; padding: 4pt 6pt; font-size: 9.5pt; text-align: left; vertical-align: top; }',
    'th { background: #F1EEE4; font-weight: bold; }',
    '.status-done { color: #2F6B4E; font-weight: bold; }',
    '.status-todo { color: #8C8577; }',
    '.lesson-block { margin: 0 0 10pt; padding-bottom: 6pt; border-bottom: 1pt dotted #D8D0BE; }',
    '.lesson-block h3 { margin: 0 0 2pt; }',
    '.lesson-meta { font-size: 9.5pt; color: #6C766E; margin: 0 0 3pt; }',
    '.practice { font-size: 10.5pt; }',
    '.note { margin: 0 0 8pt; padding: 5pt 8pt; background: #F7F5EE; border-left: 3pt solid #C9B98F; }',
    '.note b { font-size: 10pt; }',
    '.doc-footer { margin-top: 20pt; padding-top: 6pt; border-top: 1pt solid #C9C1B0; font-size: 9pt; color: #7A837B; }'
  ].join('\n');

  /* ---------- date & text helpers ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseYMD(s) {
    const p = String(s).split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function addDays(d, n) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }
  function todayKey() { return ymd(new Date()); }
  function fmtShort(s) {
    const d = typeof s === 'string' ? parseYMD(s) : s;
    return (d.getMonth() + 1) + '/' + d.getDate();
  }
  function fmtDateCN(s) {
    const d = typeof s === 'string' ? parseYMD(s) : s;
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }
  function fmtFull(d) {
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }
  function fmtDuration(sec) { return Math.floor(sec / 60) + ':' + pad2(sec % 60); }
  function fmtStamp(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return fmtShort(d) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nl2br(s) { return String(s).replace(/\n/g, '<br>'); }
  function diffDays(a, b) {
    return Math.round((parseYMD(b) - parseYMD(a)) / 86400000);
  }

  function defaultStartDate(base) {
    const d = base || new Date();
    const dow = d.getDay();
    const diff = dow === 1 ? 0 : (8 - dow) % 7;
    return ymd(addDays(d, diff));
  }

  /* ---------- state ---------- */

  let state = null;
  let SCHEDULE = null;
  let saveTimer = null;
  let openModal = null;
  let lastFocus = null;
  let courseStage = 'all';
  let courseQuery = '';
  let hideDone = false;

  function defaultState() {
    return {
      version: 1,
      settings: { startDate: defaultStartDate() },
      progress: {},
      notes: {},
      reviews: {},
      createdAt: new Date().toISOString()
    };
  }

  function normalizeState(raw) {
    const base = defaultState();
    const s = raw && typeof raw === 'object' ? raw : {};
    const out = {
      version: 1,
      settings: {
        startDate: s.settings && /^\d{4}-\d{2}-\d{2}$/.test(s.settings.startDate)
          ? s.settings.startDate
          : base.settings.startDate
      },
      progress: {},
      notes: {},
      reviews: {},
      createdAt: s.createdAt || base.createdAt
    };
    if (s.progress && typeof s.progress === 'object') {
      Object.keys(s.progress).forEach(function (k) {
        if (LESSON_MAP.has(k) && s.progress[k] && typeof s.progress[k] === 'object') out.progress[k] = s.progress[k];
      });
    }
    if (s.notes && typeof s.notes === 'object') {
      Object.keys(s.notes).forEach(function (k) {
        if (LESSON_MAP.has(k) && s.notes[k] && typeof s.notes[k] === 'object') out.notes[k] = s.notes[k];
      });
    }
    if (s.reviews && typeof s.reviews === 'object') {
      Object.keys(s.reviews).forEach(function (k) {
        if (s.reviews[k] && typeof s.reviews[k] === 'object') out.reviews[k] = s.reviews[k];
      });
    }
    return out;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return normalizeState(JSON.parse(raw));
    } catch (e) {
      return defaultState();
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      markSaved();
    } catch (e) {
      setSaveStatus('未能保存');
      toast('浏览器存储不可用，记录可能无法保留');
    }
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    setSaveStatus('保存中…');
    saveTimer = setTimeout(function () { saveTimer = null; persist(); }, 350);
  }

  function setSaveStatus(text) {
    const el = $('#saveStatus');
    if (el) el.textContent = text;
  }

  function markSaved() {
    const d = new Date();
    setSaveStatus('已自动保存 ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()));
  }

  function getProgress(id) {
    if (!state.progress[id]) state.progress[id] = {};
    return state.progress[id];
  }

  function isDone(id) { return !!(state.progress[id] && state.progress[id].done); }

  /* ---------- schedule ---------- */

  function buildSchedule(startISO, lessons) {
    const start = parseYMD(startISO);
    const days = [];
    let li = 0;
    let d = new Date(start);
    let guard = 0;

    while (guard++ < 900) {
      const dow = d.getDay();
      const key = ymd(d);
      if (dow === 0) {
        days.push({ date: key, type: 'review' });
      } else if (li < lessons.length) {
        days.push({ date: key, type: 'lesson', lessonId: lessons[li].id });
        li++;
      } else {
        days.push({ date: key, type: 'free' });
      }
      if (li >= lessons.length && dow === 0) break;
      d = addDays(d, 1);
    }

    const dayMap = {};
    const weeks = [];
    const weekMap = new Map();

    days.forEach(function (x, i) {
      x.index = i;
      dayMap[x.date] = x;
      const dt = parseYMD(x.date);
      const monday = addDays(dt, -((dt.getDay() + 6) % 7));
      const key = ymd(monday);
      let w = weekMap.get(key);
      if (!w) {
        w = { key: key, start: monday, days: [], number: weeks.length + 1 };
        weeks.push(w);
        weekMap.set(key, w);
      }
      x.weekKey = key;
      x.weekNumber = w.number;
      w.days.push(x);
    });

    const lessonDays = days.filter(function (x) { return x.type === 'lesson'; });
    return {
      start: startISO,
      days: days,
      dayMap: dayMap,
      weeks: weeks,
      endDate: days.length ? days[days.length - 1].date : startISO,
      lastLessonDate: lessonDays.length ? lessonDays[lessonDays.length - 1].date : null
    };
  }

  function rebuild() {
    SCHEDULE = buildSchedule(state.settings.startDate, LESSONS);
  }

  function lessonDate(id) {
    const d = SCHEDULE.days.find(function (x) { return x.lessonId === id; });
    return d ? d.date : null;
  }

  function dueIncomplete(dateKey) {
    const t = dateKey || todayKey();
    return SCHEDULE.days.filter(function (d) {
      return d.type === 'lesson' && d.date < t && !isDone(d.lessonId);
    });
  }

  function computeStats() {
    let done = 0, watched = 0, practiced = 0, videoSec = 0, notes = 0;
    LESSONS.forEach(function (l) {
      const p = state.progress[l.id] || {};
      if (p.done) { done++; videoSec += l.seconds; }
      if (p.watched) watched++;
      if (p.practiced) practiced++;
      const n = state.notes[l.id];
      if (n && (n.insight || n.confusion)) notes++;
    });
    const reviewDone = Object.keys(state.reviews).filter(function (k) { return state.reviews[k] && state.reviews[k].done; }).length;
    return {
      done: done,
      watched: watched,
      practiced: practiced,
      videoSec: videoSec,
      videoMin: Math.round(videoSec / 60),
      notes: notes,
      reviewDone: reviewDone,
      pct: Math.round(done / LESSONS.length * 100)
    };
  }

  function computeStreak() {
    const dates = new Set();
    Object.keys(state.progress).forEach(function (k) {
      const p = state.progress[k];
      if (p && p.done && p.completedAt) dates.add(p.completedAt);
    });
    Object.keys(state.reviews).forEach(function (k) {
      const r = state.reviews[k];
      if (r && r.done && r.completedAt) dates.add(r.completedAt);
    });
    let d = new Date();
    if (!dates.has(ymd(d))) d = addDays(d, -1);
    let n = 0;
    while (dates.has(ymd(d))) { n++; d = addDays(d, -1); }
    return n;
  }

  /* ---------- chrome ---------- */

  const PAGE_META = {
    today: { title: '今日', kicker: '每日一课' },
    course: { title: '课程', kicker: LESSONS.length + ' 个分 P' },
    plan: { title: '计划', kicker: '每周排期' },
    archive: { title: '档案', kicker: '进度与文档' }
  };

  function route() {
    const h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return ['today', 'course', 'plan', 'archive'].indexOf(h) >= 0 ? h : 'today';
  }

  function updateChrome(r) {
    const meta = PAGE_META[r] || PAGE_META.today;
    const title = $('#pageTitle');
    const kicker = $('#pageKicker');
    if (title) title.textContent = meta.title;
    if (kicker) kicker.textContent = r === 'plan' ? SCHEDULE.weeks.length + ' 周排期' : meta.kicker;
    document.title = meta.title + ' · 竹韵学习计划';
    $$('[data-nav]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === r);
    });
  }

  function updateSidebar() {
    const s = computeStats();
    const ring = $('#sideRing');
    if (ring) ring.style.setProperty('--p', s.pct);
    const rt = $('#sideRingText');
    if (rt) rt.textContent = s.pct + '%';
    const sd = $('#sideDone');
    if (sd) sd.textContent = s.done + ' / ' + LESSONS.length;
  }

  /* ---------- rendering: shared ---------- */

  function stageChip(l) {
    return '<span class="stage-chip stage-' + l.stage + '">' + STAGES[l.stage].name + '</span>';
  }

  function statusText(done) {
    return '<span class="lesson-status ' + (done ? 'done' : '') + '">' + (done ? '已完成' : '待学习') + '</span>';
  }

  function checkBtn(field, on, label, id) {
    return '<button type="button" class="check ' + (on ? 'on' : '') + '" data-action="toggle-' + field + '" data-id="' + id + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
      '<span class="box">✓</span>' + label + '</button>';
  }

  function lessonCardHTML(l, opts) {
    opts = opts || {};
    const p = state.progress[l.id] || {};
    const done = !!p.done;
    const hint = done && p.completedAt
      ? '完成于 ' + fmtShort(p.completedAt)
      : (p.updatedAt ? '上次更新 ' + fmtStamp(p.updatedAt) : '完成后会计入档案');
    return '<article class="lesson-card stage-' + l.stage + (done ? ' is-done' : '') + '">' +
      '<div class="lesson-top">' +
        '<span class="seal-no">' + pad2(l.part) + '</span>' +
        '<div class="lesson-meta">' +
          stageChip(l) +
          '<span class="meta-dot"></span><span>编号 ' + l.no + '</span>' +
          '<span class="meta-dot"></span><span>视频 ' + fmtDuration(l.seconds) + '</span>' +
          '<span class="meta-dot"></span><span>建议练习 30 分钟</span>' +
        '</div>' +
        statusText(done) +
      '</div>' +
      (opts.modal ? '' : '<h3>' + esc(l.title) + '</h3>') +
      '<p class="summary">' + esc(l.summary) + '</p>' +
      '<div class="practice-box"><span class="label">练习重点</span><p>' + esc(l.practice) + '</p></div>' +
      '<div class="checks">' + checkBtn('watched', !!p.watched, '看完视频', l.id) + checkBtn('practiced', !!p.practiced, '完成练习', l.id) + '</div>' +
      '<div class="lesson-actions">' +
        '<button type="button" class="btn ' + (done ? 'done-state' : 'primary') + '" data-action="toggle-done" data-id="' + l.id + '">' +
          (done ? '已完成 · 点击撤销' : '标记本课完成') +
        '</button>' +
        '<a class="btn ghost" href="' + COURSE_DATA.sourceUrl + '?p=' + l.part + '" target="_blank" rel="noopener">去 B 站看视频</a>' +
        (opts.modal ? '' : '<button type="button" class="btn ghost" data-action="open-lesson" data-id="' + l.id + '">课程详情</button>') +
        '<span class="hint">' + hint + '</span>' +
      '</div>' +
    '</article>';
  }

  function notesHTML(l) {
    const n = state.notes[l.id] || {};
    return '<section class="notes-card">' +
      '<div class="notes-head"><h3>练习记录</h3><span>输入后自动保存到本机</span></div>' +
      '<div class="notes-grid">' +
        '<label>练习感悟<textarea data-note="insight" data-id="' + l.id + '" placeholder="例如：今天长音到第 6 拍开始发虚；换指比昨天干净。">' + esc(n.insight || '') + '</textarea></label>' +
        '<label>困惑 / 待解决<textarea data-note="confusion" data-id="' + l.id + '" placeholder="例如：高音 3 总是偏低；第 8 小节换气来不及。">' + esc(n.confusion || '') + '</textarea></label>' +
      '</div>' +
    '</section>';
  }

  function reviewCardHTML(week, modal) {
    const rev = state.reviews[week.key] || {};
    const lessons = week.days.filter(function (d) { return d.type === 'lesson'; });
    const doneCount = lessons.filter(function (d) { return isDone(d.lessonId); }).length;
    return '<article class="review-card">' +
      '<div class="lesson-top">' +
        '<span class="stage-chip stage-theory">周日复盘</span>' +
        '<div class="lesson-meta"><span>第 ' + week.number + ' 周</span><span class="meta-dot"></span><span>本周完成 ' + doneCount + ' / ' + lessons.length + ' 课</span></div>' +
        '<span class="lesson-status ' + (rev.done ? 'done' : '') + '">' + (rev.done ? '已复盘' : '待复盘') + '</span>' +
      '</div>' +
      (modal ? '' : '<h3>第 ' + week.number + ' 周复盘</h3>') +
      '<p class="summary">用周日把这一周串起来：回看练习重点，吹一遍长音和音阶，再把最熟的一首曲子完整走一遍。</p>' +
      '<ul class="review-list">' +
        '<li>回看本周 ' + lessons.length + ' 课的练习重点，挑最卡的 2 条再练 10 分钟。</li>' +
        '<li>长音与五声音阶各吹一遍，录音听音色和音准。</li>' +
        '<li>完整吹一遍本周最熟的曲子，标记断点。</li>' +
        '<li>写下一个下周要解决的问题。</li>' +
      '</ul>' +
      '<div class="lesson-actions">' +
        '<button type="button" class="btn ' + (rev.done ? 'done-state' : 'primary') + '" data-action="toggle-review" data-week="' + week.key + '">' + (rev.done ? '已复盘 · 点击撤销' : '标记复盘完成') + '</button>' +
        '<span class="hint">' + (rev.done && rev.completedAt ? '完成于 ' + fmtShort(rev.completedAt) : '复盘也计入连续打卡') + '</span>' +
      '</div>' +
      '<section class="notes-card" style="box-shadow:none;margin-top:16px">' +
        '<div class="notes-head"><h3>本周复盘笔记</h3><span>输入后自动保存</span></div>' +
        '<textarea data-review-note="' + week.key + '" placeholder="这一周最明显的进步、仍然卡住的地方、下周的练习重点……">' + esc(rev.note || '') + '</textarea>' +
      '</section>' +
    '</article>';
  }

  function nextListHTML() {
    const t = todayKey();
    const upcoming = SCHEDULE.days.filter(function (d) { return d.type === 'lesson' && d.date >= t; }).slice(0, 3);
    if (!upcoming.length) return '';
    return '<section class="panel">' +
      '<div class="panel-head"><h3>接下来</h3><a class="text-link" href="#/plan">完整计划</a></div>' +
      '<div class="next-list">' + upcoming.map(function (d) {
        const l = LESSON_MAP.get(d.lessonId);
        return '<button type="button" class="next-row" data-action="open-lesson" data-id="' + l.id + '">' +
          '<span class="next-date">' + fmtShort(d.date) + '<br>' + WEEK_CN[parseYMD(d.date).getDay()] + '</span>' +
          '<span><span class="next-title">' + esc(l.title) + '</span><span class="next-meta">P' + pad2(l.part) + ' · ' + STAGES[l.stage].name + ' · ' + fmtDuration(l.seconds) + '</span></span>' +
          '<span class="muted">›</span>' +
        '</button>';
      }).join('') + '</div>' +
    '</section>';
  }

  /* ---------- rendering: today ---------- */

  function renderToday() {
    const t = todayKey();
    const start = state.settings.startDate;
    const info = SCHEDULE.dayMap[t];
    const stats = computeStats();
    const prestart = t < start;
    let badge;
    if (prestart) badge = { num: '—', label: '未开课' };
    else if (info) badge = { num: info.index + 1, label: '计划日' };
    else badge = { num: stats.done, label: '课完成' };

    let title = '今日课程';
    let lede = '先看视频，再按练习重点吹 30 分钟。哪怕只练一小段，也比赶进度更重要。';
    if (prestart) {
      title = '开课前的准备';
      lede = '计划于 ' + fmtDateCN(start) + ' 开始。先用几天把笛子、笛膜和每天的练习时间准备好。';
    } else if (!info) {
      title = '计划周期已走完';
      lede = '这一轮排期已经结束。接下来交给复习、完整演奏和查漏补缺。';
    } else if (info.type === 'review') {
      title = '本周复盘';
      lede = '把这一周的练习串一遍，记录仍不稳的地方，下周带着问题学。';
    } else if (info.type === 'free') {
      title = '自由练习';
      lede = '今天没有新排课，用完整演奏和复习把学过的内容串起来。';
    }

    let body = '';
    if (prestart) body = renderPrestart();
    else if (!info) body = renderFinished(stats);
    else if (info.type === 'review') body = renderReviewDay(info);
    else if (info.type === 'free') body = renderFreeDay(stats);
    else body = renderLessonDay(info);

    const pending = dueIncomplete();
    const banner = pending.length && info && info.type === 'lesson'
      ? '<div class="banner"><div><strong>有 ' + pending.length + ' 课待补</strong><p>' +
          pending.slice(0, 3).map(function (d) { return 'P' + pad2(LESSON_MAP.get(d.lessonId).part) + ' ' + esc(LESSON_MAP.get(d.lessonId).title); }).join('、') +
          (pending.length > 3 ? ' 等' : '') +
        '</p></div><button type="button" class="btn small" data-action="open-lesson" data-id="' + pending[0].lessonId + '">先补这一课</button></div>'
      : '';

    return '<section class="today-head">' +
        '<div><p class="eyebrow">' + fmtFull(new Date()) + ' · ' + WEEK_CN[new Date().getDay()] + '</p>' +
        '<h2>' + title + '</h2><p class="lede">' + lede + '</p></div>' +
        '<div class="day-badge"><strong>' + badge.num + '</strong><span>' + badge.label + '</span></div>' +
      '</section>' + banner + body;
  }

  function renderPrestart() {
    const t = todayKey();
    const days = diffDays(t, state.settings.startDate);
    const first = LESSONS[0];
    const prep = [
      ['备好笛子与笛膜', '确认笛子的调性，准备 2–3 张笛膜和一小碗清水。'],
      ['固定练习时段', '每天留出 30 分钟。时间短没关系，关键是每天都吹。'],
      ['先看一遍目录', '80 个分 P 按入门、技法、乐理、流行曲、独奏曲排列，心里先有路线。']
    ];
    return '<section class="prestart">' +
        '<div class="prestart-main">' +
          '<p class="eyebrow">开课准备 · 第 0 周</p>' +
          '<h2>' + fmtDateCN(state.settings.startDate) + ' 开课</h2>' +
          '<p class="lede">前面的几节课都很短。先把“每天摸一下笛子”变成习惯，再谈进度。</p>' +
          '<div class="countdown"><strong>' + days + '</strong><span>天后开始</span></div>' +
          '<div class="prestart-actions">' +
            '<button type="button" class="btn primary" data-action="start-today">改为今天开始</button>' +
            '<button type="button" class="btn ghost" data-action="open-lesson" data-id="' + first.id + '">预览第一课</button>' +
          '</div>' +
        '</div>' +
        '<div class="prep-panel"><h3>开课清单</h3><ul class="prep-list">' +
          prep.map(function (x, i) {
            return '<li><span class="num">' + (i + 1) + '</span><div><strong>' + x[0] + '</strong><p>' + x[1] + '</p></div></li>';
          }).join('') +
        '</ul></div>' +
      '</section>' + nextListHTML();
  }

  function renderLessonDay(info) {
    const l = LESSON_MAP.get(info.lessonId);
    return lessonCardHTML(l) + notesHTML(l) + nextListHTML();
  }

  function renderReviewDay(info) {
    const week = SCHEDULE.weeks.find(function (w) { return w.key === info.weekKey; });
    return reviewCardHTML(week, false) + nextListHTML();
  }

  function renderFreeDay(stats) {
    const remaining = LESSONS.filter(function (l) { return !isDone(l.id); });
    if (!remaining.length) {
      return '<div class="complete-card"><div class="seal">成</div><h2>80 课已全部完成</h2>' +
        '<p>课程内容已经走完。接下来可以按独奏曲目做完整演奏，或者挑最不稳的几课回炉。</p>' +
        '<div class="prestart-actions" style="justify-content:center">' +
          '<a class="btn primary" href="#/archive">查看学习档案</a>' +
          '<button type="button" class="btn ghost" data-action="export-doc">导出学习文档</button>' +
        '</div></div>';
    }
    const l = remaining[0];
    return '<section class="panel"><div class="panel-head"><h3>今天没有新排课</h3><span class="muted">已完成 ' + stats.done + ' / ' + LESSONS.length + '</span></div>' +
      '<p class="panel-sub">可以自由复习，也可以提前学下一课。建议至少保留 20 分钟长音和音阶。</p>' +
      '<div class="lesson-actions"><button type="button" class="btn primary" data-action="open-lesson" data-id="' + l.id + '">继续 P' + pad2(l.part) + '</button>' +
      '<a class="btn ghost" href="#/plan">查看计划</a></div></section>' + nextListHTML();
  }

  function renderFinished(stats) {
    const remaining = LESSONS.length - stats.done;
    return '<div class="complete-card"><div class="seal">竹</div><h2>' + (remaining ? '计划周期已结束' : '80 课全部完成') + '</h2>' +
      '<p>' + (remaining
        ? '这一轮排期已经走完，还有 ' + remaining + ' 课没有完成。可以继续补课，也可以在计划页把开课日期往后调，重新排一轮。'
        : '从入门到独奏曲，80 个分 P 都学完了。建议保留每周 2–3 次练习，继续打磨音色和完整曲目。') + '</p>' +
      '<div class="prestart-actions" style="justify-content:center">' +
        '<a class="btn primary" href="#/plan">调整计划</a>' +
        '<a class="btn ghost" href="#/archive">查看学习档案</a>' +
      '</div></div>' + nextListHTML();
  }

  /* ---------- rendering: course ---------- */

  function filteredLessons() {
    const q = courseQuery.toLowerCase();
    return LESSONS.filter(function (l) {
      if (courseStage !== 'all' && l.stage !== courseStage) return false;
      if (hideDone && isDone(l.id)) return false;
      if (!q) return true;
      return (l.title + ' ' + l.summary + ' ' + l.practice + ' ' + l.no).toLowerCase().indexOf(q) >= 0;
    });
  }

  function lessonListHTML() {
    const list = filteredLessons();
    if (!list.length) return '<div class="empty">没有匹配的课程，换个关键词或筛选条件试试。</div>';
    return list.map(function (l) {
      const done = isDone(l.id);
      return '<button type="button" class="lesson-row' + (done ? ' done' : '') + '" data-action="open-lesson" data-id="' + l.id + '">' +
        '<span class="row-no">' + pad2(l.part) + '</span>' +
        '<span><span class="row-title">' + esc(l.title) + '</span>' +
        '<span class="row-summary">' + esc(l.summary) + '</span>' +
        '<span class="row-meta">' + STAGES[l.stage].name + ' · 编号 ' + l.no + ' · 视频 ' + fmtDuration(l.seconds) + '</span></span>' +
        '<span class="row-state">' + (done ? '已完成' : '未完成') + '</span>' +
      '</button>';
    }).join('');
  }

  function renderCourse() {
    const stageCounts = { all: LESSONS.length };
    Object.keys(STAGES).forEach(function (k) {
      stageCounts[k] = LESSONS.filter(function (l) { return l.stage === k; }).length;
    });
    const pills = [
      '<button type="button" class="filter ' + (courseStage === 'all' ? 'active' : '') + '" data-action="filter-stage" data-stage="all">全部 · ' + stageCounts.all + '</button>'
    ].concat(Object.keys(STAGES).map(function (k) {
      return '<button type="button" class="filter ' + (courseStage === k ? 'active' : '') + '" data-action="filter-stage" data-stage="' + k + '">' + STAGES[k].name + ' · ' + stageCounts[k] + '</button>';
    })).join('');

    return '<section class="page-head"><h2>课程目录</h2><p class="lede">80 个分 P，按入门基础、进阶技法、乐理与欣赏、流行曲、独奏曲排列。点开任意一课，可以看简介、做标记、写笔记。</p></section>' +
      '<div class="toolbar">' +
        '<div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>' +
        '<input id="courseSearch" type="search" aria-label="搜索课程" placeholder="搜索课程，例如：长音、吐音、姑苏行" value="' + esc(courseQuery) + '" autocomplete="off"></div>' +
        '<div class="filters">' + pills + '</div>' +
      '</div>' +
      '<div class="course-tools"><span class="result-count" id="resultCount">' + filteredLessons().length + ' / ' + LESSONS.length + ' 课</span>' +
        '<button type="button" class="filter ' + (hideDone ? 'active' : '') + '" data-action="toggle-hide-done" aria-pressed="' + (hideDone ? 'true' : 'false') + '">只看未完成</button></div>' +
      '<p class="gap-note">' + esc(COURSE_DATA.gapNote) + '</p>' +
      '<div class="lesson-list" id="lessonList">' + lessonListHTML() + '</div>';
  }

  function renderLessonList() {
    const list = $('#lessonList');
    if (list) list.innerHTML = lessonListHTML();
    const count = $('#resultCount');
    if (count) count.textContent = filteredLessons().length + ' / ' + LESSONS.length + ' 课';
  }

  /* ---------- rendering: plan ---------- */

  function renderPlan() {
    const start = state.settings.startDate;
    const last = SCHEDULE.lastLessonDate;
    const weeks = SCHEDULE.weeks.map(function (w, idx) {
      const lessons = w.days.filter(function (d) { return d.type === 'lesson'; });
      const doneCount = lessons.filter(function (d) { return isDone(d.lessonId); }).length;
      const isCurrent = w.days.some(function (d) { return d.date === todayKey(); });
      const firstDay = w.days[0].date;
      const lastDay = w.days[w.days.length - 1].date;
      return '<details class="week"' + (isCurrent || idx === 0 ? ' open' : '') + '>' +
        '<summary>' +
          '<span class="week-no">第 ' + w.number + ' 周</span>' +
          '<span class="week-range">' + fmtShort(firstDay) + ' – ' + fmtShort(lastDay) + '</span>' +
          '<span class="week-count">' + doneCount + ' / ' + lessons.length + ' 完成</span>' +
          '<svg class="week-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>' +
        '</summary>' +
        '<div class="week-body">' + w.days.map(dayRowHTML).join('') + '</div>' +
      '</details>';
    }).join('');

    return '<section class="page-head"><h2>学习计划</h2><p class="lede">周一至周六每天 1 个分 P，周日复盘。视频之外，每天留 30 分钟练习；进度落后时优先补课，不必跳着学。</p></section>' +
      '<section class="pace-card">' +
        '<div><h3>学习节奏</h3><p>每天一个分 P，按课程顺序推进。每 6 课后安排一个复盘日，用来巩固长音、音阶和本周曲目。</p>' +
          '<div class="pace-meta" style="text-align:left;margin-top:8px">最后一课 <strong>' + (last ? fmtDateCN(last) : '—') + '</strong> · 复盘日 <strong>' + fmtDateCN(SCHEDULE.endDate) + '</strong></div>' +
        '</div>' +
        '<div class="pace-right">' +
          '<label class="date-field">开课日期<input type="date" id="startDate" value="' + start + '"></label>' +
          '<span class="pace-meta">共 <strong>' + LESSONS.length + '</strong> 课 · <strong>' + SCHEDULE.weeks.length + '</strong> 周 · 每周一至周六</span>' +
        '</div>' +
      '</section>' +
      '<div class="weeks">' + weeks + '</div>';
  }

  function dayRowHTML(d) {
    const today = d.date === todayKey();
    const dow = parseYMD(d.date).getDay();
    if (d.type === 'lesson') {
      const l = LESSON_MAP.get(d.lessonId);
      const done = isDone(l.id);
      return '<button type="button" class="day-row' + (today ? ' today' : '') + '" data-action="open-lesson" data-id="' + l.id + '">' +
        '<span class="day-date"><b>' + parseYMD(d.date).getDate() + '</b><small>' + WEEK_CN[dow] + '</small></span>' +
        '<span><span class="day-title">' + esc(l.title) + '</span><span class="day-meta">P' + pad2(l.part) + ' · ' + STAGES[l.stage].name + ' · ' + fmtDuration(l.seconds) + '</span></span>' +
        '<span class="day-state"><span class="dot ' + (done ? 'done' : '') + '"></span><span>' + (done ? '已完成' : '待学习') + '</span></span>' +
      '</button>';
    }
    if (d.type === 'review') {
      const rev = state.reviews[d.weekKey] || {};
      return '<button type="button" class="day-row review' + (today ? ' today' : '') + '" data-action="open-review" data-week="' + d.weekKey + '">' +
        '<span class="day-date"><b>' + parseYMD(d.date).getDate() + '</b><small>' + WEEK_CN[dow] + '</small></span>' +
        '<span><span class="day-title">第 ' + d.weekNumber + ' 周复盘 <span class="muted">· 长音、音阶与本周曲目</span></span><span class="day-meta">写复盘笔记，整理下周问题</span></span>' +
        '<span class="day-state"><span class="dot ' + (rev.done ? 'done' : 'review') + '"></span><span>' + (rev.done ? '已复盘' : '复盘') + '</span></span>' +
      '</button>';
    }
    return '<div class="day-row plain' + (today ? ' today' : '') + '">' +
      '<span class="day-date"><b>' + parseYMD(d.date).getDate() + '</b><small>' + WEEK_CN[dow] + '</small></span>' +
      '<span><span class="day-title">自由练习 <span class="muted">· 完整演奏或补课</span></span><span class="day-meta">没有新排课</span></span>' +
      '<span class="day-state"><span class="dot"></span><span>自由</span></span>' +
    '</div>';
  }

  /* ---------- rendering: archive ---------- */

  function renderArchive() {
    const s = computeStats();
    const streak = computeStreak();
    const noteEntries = LESSONS.map(function (l) {
      return { l: l, n: state.notes[l.id] };
    }).filter(function (x) {
      return x.n && (x.n.insight || x.n.confusion);
    });
    const reviewEntries = SCHEDULE.weeks.filter(function (w) {
      const r = state.reviews[w.key];
      return r && (r.done || r.note);
    });

    const stats = '<div class="stat-grid">' +
      '<div class="stat"><span class="num">' + s.done + '<small>/ ' + LESSONS.length + '</small></span><span class="label">完成课程</span></div>' +
      '<div class="stat"><span class="num">' + (s.videoSec >= 3600 ? (s.videoSec / 3600).toFixed(1) + '<small>小时</small>' : s.videoMin + '<small>分钟</small>') + '</span><span class="label">累计完成视频</span></div>' +
      '<div class="stat"><span class="num">' + s.practiced + '<small>次</small></span><span class="label">练习打卡</span></div>' +
      '<div class="stat"><span class="num">' + s.notes + '<small>条</small></span><span class="label">练习笔记</span></div>' +
    '</div>';

    const exportPanel = '<section class="panel" id="exportPanel">' +
      '<div class="panel-head"><h3>导出学习文档</h3><span class="muted">Word / Markdown / PDF</span></div>' +
      '<p class="panel-sub">文档包含学习周期、每周安排、80 课简介与练习重点、完成状态、练习感悟和每周复盘。生成时会读取当前最新记录。</p>' +
      '<div class="export-actions">' +
        '<button type="button" class="btn primary" data-action="export-doc">下载 Word（.doc）</button>' +
        '<button type="button" class="btn" data-action="export-md">下载 Markdown</button>' +
        '<button type="button" class="btn ghost" data-action="print-doc">打印 / 存为 PDF</button>' +
      '</div>' +
    '</section>';

    const progressPanel = '<section class="panel">' +
      '<div class="panel-head"><h3>学习进度</h3><span class="muted">连续打卡 ' + streak + ' 天 · 复盘 ' + s.reviewDone + ' 周</span></div>' +
      '<div class="bamboo-grid">' + LESSONS.map(function (l) {
        return '<span class="bamboo-node stage-' + l.stage + (isDone(l.id) ? ' on' : '') + '" title="P' + pad2(l.part) + ' ' + esc(l.title) + (isDone(l.id) ? ' · 已完成' : '') + '"></span>';
      }).join('') + '</div>' +
      '<div class="legend">' + Object.keys(STAGES).map(function (k) {
        return '<span><i class="stage-' + k + '" style="background:' + STAGES[k].color + '"></i>' + STAGES[k].name + '</span>';
      }).join('') + '<span><i style="background:#ECE5D5;border:1px solid #DED5C1"></i>未开始</span></div>' +
    '</section>';

    const notesPanel = '<section class="panel">' +
      '<div class="panel-head"><h3>练习笔记</h3><span class="muted">' + noteEntries.length + ' 课有记录</span></div>' +
      (noteEntries.length ? noteEntries.map(function (x) {
        const d = lessonDate(x.l.id);
        return '<div class="note-entry">' +
          '<div class="note-entry-head"><strong>P' + pad2(x.l.part) + ' · ' + esc(x.l.title) + '</strong><span>' + (d ? fmtShort(d) : '') + '</span></div>' +
          (x.n.insight ? '<p><span class="tag">感悟</span>' + nl2br(esc(x.n.insight)) + '</p>' : '') +
          (x.n.confusion ? '<p class="confusion"><span class="tag">困惑</span>' + nl2br(esc(x.n.confusion)) + '</p>' : '') +
        '</div>';
      }).join('') : '<div class="empty">还没有练习笔记。在“今日”或课程详情里写下第一条吧。</div>') +
    '</section>';

    const reviewsPanel = '<section class="panel">' +
      '<div class="panel-head"><h3>每周复盘</h3><span class="muted">' + reviewEntries.length + ' 周有记录</span></div>' +
      (reviewEntries.length ? reviewEntries.map(function (w) {
        const r = state.reviews[w.key];
        return '<div class="note-entry">' +
          '<div class="note-entry-head"><strong>第 ' + w.number + ' 周 · ' + fmtShort(w.days[0].date) + ' – ' + fmtShort(w.days[w.days.length - 1].date) + '</strong><span>' + (r.done ? '已完成' : '未完成') + '</span></div>' +
          (r.note ? '<p>' + nl2br(esc(r.note)) + '</p>' : '<p class="muted">已完成复盘，未填写文字。</p>') +
        '</div>';
      }).join('') : '<div class="empty">还没有周复盘。每周日花 10 分钟写一条就够了。</div>') +
    '</section>';

    const backupPanel = '<section class="panel">' +
      '<div class="panel-head"><h3>数据备份</h3><span class="muted">保存在本机浏览器</span></div>' +
      '<p class="panel-sub">完成记录和笔记保存在当前浏览器里，不会上传。换设备、重装浏览器或清理缓存前，请先导出备份文件。</p>' +
      '<div class="backup-actions">' +
        '<button type="button" class="btn" data-action="export-json">导出备份（.json）</button>' +
        '<button type="button" class="btn ghost" data-action="import-json">导入备份</button>' +
        '<input type="file" id="importFile" accept=".json,application/json" hidden>' +
      '</div>' +
      '<div style="margin-top:14px"><button type="button" class="danger-link" data-action="reset">清空所有记录，重新开始</button></div>' +
    '</section>';

    return '<section class="page-head"><h2>学习档案</h2><p class="lede">完成情况、练习笔记和每周复盘都会即时更新。需要带走时，可以导出成 Word、Markdown 或 PDF。</p></section>' +
      stats + exportPanel + progressPanel +
      '<h3 class="archive-subhead">练习记录</h3>' + notesPanel + reviewsPanel + backupPanel;
  }

  /* ---------- rendering root ---------- */

  function render(options) {
    options = options || {};
    if (!SCHEDULE) rebuild();
    const r = route();
    const y = window.scrollY;
    updateChrome(r);
    updateSidebar();
    const view = $('#view');
    if (!view) return;
    if (r === 'course') view.innerHTML = renderCourse();
    else if (r === 'plan') view.innerHTML = renderPlan();
    else if (r === 'archive') view.innerHTML = renderArchive();
    else view.innerHTML = renderToday();
    if (options.keepScroll) window.scrollTo(0, y);
    else window.scrollTo(0, 0);
  }

  /* ---------- modal ---------- */

  function openLessonModal(id, silent) {
    const l = LESSON_MAP.get(id);
    if (!l) return;
    if (!silent) lastFocus = document.activeElement;
    openModal = { type: 'lesson', id: id };
    const root = $('#modalRoot');
    root.innerHTML = '<div class="modal-backdrop">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
        '<button type="button" class="modal-close" data-action="close-modal" aria-label="关闭">×</button>' +
        '<h2 id="modalTitle">P' + pad2(l.part) + ' · ' + esc(l.title) + '</h2>' +
        lessonCardHTML(l, { modal: true }) +
        notesHTML(l) +
      '</div>' +
    '</div>';
    document.body.classList.add('modal-open');
    if (!silent) {
      const btn = $('.modal-close');
      if (btn) btn.focus();
    }
  }

  function openReviewModal(weekKey, silent) {
    const week = SCHEDULE.weeks.find(function (w) { return w.key === weekKey; });
    if (!week) return;
    if (!silent) lastFocus = document.activeElement;
    openModal = { type: 'review', weekKey: weekKey };
    const root = $('#modalRoot');
    root.innerHTML = '<div class="modal-backdrop">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
        '<button type="button" class="modal-close" data-action="close-modal" aria-label="关闭">×</button>' +
        '<h2 id="modalTitle">第 ' + week.number + ' 周复盘</h2>' +
        reviewCardHTML(week, true) +
      '</div>' +
    '</div>';
    document.body.classList.add('modal-open');
    if (!silent) {
      const btn = $('.modal-close');
      if (btn) btn.focus();
    }
  }

  function refreshOpenModal() {
    if (!openModal) return;
    if (openModal.type === 'lesson') openLessonModal(openModal.id, true);
    else openReviewModal(openModal.weekKey, true);
  }

  function closeModal() {
    $('#modalRoot').innerHTML = '';
    document.body.classList.remove('modal-open');
    openModal = null;
    render({ keepScroll: true });
    if (lastFocus && document.contains(lastFocus)) {
      try { lastFocus.focus(); } catch (e) { /* ignore */ }
    }
    lastFocus = null;
  }

  /* ---------- actions ---------- */

  function toggleField(id, field) {
    const p = getProgress(id);
    p[field] = !p[field];
    p.updatedAt = new Date().toISOString();
    persist();
    render({ keepScroll: true });
    refreshOpenModal();
  }

  function toggleDone(id) {
    const p = getProgress(id);
    p.done = !p.done;
    p.updatedAt = new Date().toISOString();
    if (p.done) p.completedAt = todayKey();
    else delete p.completedAt;
    persist();
    render({ keepScroll: true });
    refreshOpenModal();
    toast(p.done ? '已标记完成' : '已撤销完成');
  }

  function toggleReview(weekKey) {
    if (!state.reviews[weekKey]) state.reviews[weekKey] = {};
    const r = state.reviews[weekKey];
    r.done = !r.done;
    if (r.done) r.completedAt = todayKey();
    else delete r.completedAt;
    r.updatedAt = new Date().toISOString();
    persist();
    render({ keepScroll: true });
    refreshOpenModal();
    toast(r.done ? '本周复盘已完成' : '已撤销复盘');
  }

  function startToday() {
    const d = new Date();
    const start = d.getDay() === 0 ? ymd(addDays(d, 1)) : ymd(d);
    state.settings.startDate = start;
    rebuild();
    persist();
    render();
    toast(d.getDay() === 0 ? '周日先休息，已从周一开始' : '已从今天开始');
  }

  function changeStartDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    state.settings.startDate = value;
    rebuild();
    persist();
    render({ keepScroll: true });
    toast('已按新的开课日期重新排课');
  }

  function resetAll() {
    if (!confirm('将清空所有完成记录、练习笔记和每周复盘。确定吗？建议先导出备份。')) return;
    state = defaultState();
    rebuild();
    persist();
    render();
    toast('已清空，重新开始');
  }

  /* ---------- export ---------- */

  function lessonNotesText(l) {
    const n = state.notes[l.id] || {};
    return { insight: n.insight || '', confusion: n.confusion || '' };
  }

  function buildDocBody() {
    const s = computeStats();
    const start = state.settings.startDate;
    const last = SCHEDULE.lastLessonDate;
    const generated = fmtFull(new Date());

    const metaRows = [
      ['课程', COURSE_DATA.title + '（' + LESSONS.length + ' 个分 P）'],
      ['学习周期', fmtDateCN(start) + ' – ' + (last ? fmtDateCN(last) : '—')],
      ['学习节奏', '周一至周六每天 1 个分 P，周日复盘；每天练习约 30 分钟'],
      ['完成进度', s.done + ' / ' + LESSONS.length + ' 课（' + s.pct + '%）'],
      ['累计完成视频', s.videoMin + ' 分钟'],
      ['练习打卡', s.practiced + ' 次'],
      ['每周复盘', s.reviewDone + ' 周'],
      ['生成日期', generated]
    ].map(function (r) { return '<tr><td style="width:26%">' + r[0] + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('');

    const weekly = SCHEDULE.weeks.map(function (w) {
      const lessons = w.days.filter(function (d) { return d.type === 'lesson'; });
      if (!lessons.length) return '';
      const rows = lessons.map(function (d) {
        const l = LESSON_MAP.get(d.lessonId);
        const done = isDone(l.id);
        return '<tr><td>' + fmtShort(d.date) + ' ' + WEEK_CN[parseYMD(d.date).getDay()] + '</td>' +
          '<td>P' + pad2(l.part) + ' · ' + esc(l.title) + '</td>' +
          '<td style="width:14%">' + fmtDuration(l.seconds) + '</td>' +
          '<td class="' + (done ? 'status-done' : 'status-todo') + '" style="width:14%">' + (done ? '已完成' : '未完成') + '</td></tr>';
      }).join('');
      return '<h3>第 ' + w.number + ' 周（' + fmtShort(lessons[0].date) + ' – ' + fmtShort(lessons[lessons.length - 1].date) + '）</h3>' +
        '<table><thead><tr><th style="width:18%">日期</th><th>课程</th><th>视频</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }).join('');

    const lessonBlocks = LESSONS.map(function (l) {
      const d = lessonDate(l.id);
      const done = isDone(l.id);
      return '<div class="lesson-block">' +
        '<h3>P' + pad2(l.part) + ' · ' + esc(l.title) + '</h3>' +
        '<p class="lesson-meta">' + STAGES[l.stage].name + ' · 编号 ' + l.no + ' · 视频 ' + fmtDuration(l.seconds) +
          (d ? ' · 计划 ' + fmtShort(d) : '') + ' · ' + (done ? '已完成' : '未完成') + '</p>' +
        '<p>' + esc(l.summary) + '</p>' +
        '<p class="practice"><b>练习重点：</b>' + esc(l.practice) + '</p>' +
      '</div>';
    }).join('');

    const noteBlocks = LESSONS.map(function (l) {
      const n = lessonNotesText(l);
      if (!n.insight && !n.confusion) return '';
      const d = lessonDate(l.id);
      return '<div class="note"><b>P' + pad2(l.part) + ' · ' + esc(l.title) + '</b> <span>' + (d ? fmtShort(d) : '') + '</span>' +
        (n.insight ? '<p><b>感悟：</b>' + nl2br(esc(n.insight)) + '</p>' : '') +
        (n.confusion ? '<p><b>困惑：</b>' + nl2br(esc(n.confusion)) + '</p>' : '') +
      '</div>';
    }).join('');

    const reviewBlocks = SCHEDULE.weeks.map(function (w) {
      const r = state.reviews[w.key];
      if (!r || (!r.done && !r.note)) return '';
      return '<div class="note"><b>第 ' + w.number + ' 周复盘</b> <span>' + fmtShort(w.days[0].date) + ' – ' + fmtShort(w.days[w.days.length - 1].date) + '</span>' +
        '<p>' + (r.note ? nl2br(esc(r.note)) : '已完成复盘，未填写文字。') + '</p></div>';
    }).join('');

    const next = LESSONS.find(function (l) { return !isDone(l.id); });
    const progressLine = next
      ? '下一课建议从 P' + pad2(next.part) + '《' + esc(next.title) + '》继续。'
      : '80 个分 P 已全部完成，可以转入完整曲目复习。';

    return '<h1>竹笛学习计划与学习档案</h1>' +
      '<p class="doc-sub">《' + esc(COURSE_DATA.title) + '》 · ' + LESSONS.length + ' 个分 P · 个人学习记录</p>' +
      '<table class="meta">' + metaRows + '</table>' +
      '<h2>一、计划概览</h2>' +
      '<p>本计划按课程顺序推进，每天 1 个分 P，周日复盘。当前已完成 ' + s.done + ' 课，' + progressLine + '</p>' +
      '<p>' + esc(COURSE_DATA.gapNote) + '</p>' +
      '<h2>二、每周安排与完成情况</h2>' + weekly +
      '<h2>三、课程简介与练习重点</h2>' + lessonBlocks +
      '<h2>四、练习笔记</h2>' + (noteBlocks || '<p>还没有填写练习笔记。</p>') +
      '<h2>五、每周复盘</h2>' + (reviewBlocks || '<p>还没有填写周复盘。</p>') +
      '<p class="doc-footer">课程目录来自 B 站合集 ' + COURSE_DATA.bvid + '。简介与练习建议为学习计划整理，具体以视频讲解为准。本文件由“竹韵 · 竹笛学习计划”生成。</p>';
  }

  function buildDocHTML() {
    return '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>竹笛学习计划</title><style>' + DOC_CSS + '</style></head>' +
      '<body><div class="doc">' + buildDocBody() + '</div></body></html>';
  }

  function buildMarkdown() {
    const s = computeStats();
    const start = state.settings.startDate;
    const last = SCHEDULE.lastLessonDate;
    let md = '# 竹笛学习计划与学习档案\n\n';
    md += '- 课程：' + COURSE_DATA.title + '（' + LESSONS.length + ' 个分 P）\n';
    md += '- 学习周期：' + fmtDateCN(start) + ' – ' + (last ? fmtDateCN(last) : '—') + '\n';
    md += '- 学习节奏：周一至周六每天 1 个分 P，周日复盘；每天练习约 30 分钟\n';
    md += '- 完成进度：' + s.done + ' / ' + LESSONS.length + ' 课（' + s.pct + '%）\n';
    md += '- 累计完成视频：' + s.videoMin + ' 分钟\n';
    md += '- 生成日期：' + fmtFull(new Date()) + '\n\n';

    md += '## 一、每周安排与完成情况\n\n';
    SCHEDULE.weeks.forEach(function (w) {
      const lessons = w.days.filter(function (d) { return d.type === 'lesson'; });
      if (!lessons.length) return;
      md += '### 第 ' + w.number + ' 周（' + fmtShort(lessons[0].date) + ' – ' + fmtShort(lessons[lessons.length - 1].date) + '）\n\n';
      lessons.forEach(function (d) {
        const l = LESSON_MAP.get(d.lessonId);
        const done = isDone(l.id);
        md += '- [' + (done ? 'x' : ' ') + '] ' + fmtShort(d.date) + ' ' + WEEK_CN[parseYMD(d.date).getDay()] + ' · P' + pad2(l.part) + ' ' + l.title + '\n';
        const n = lessonNotesText(l);
        if (n.insight) md += '  - 感悟：' + n.insight.replace(/\n/g, ' ') + '\n';
        if (n.confusion) md += '  - 困惑：' + n.confusion.replace(/\n/g, ' ') + '\n';
      });
      md += '\n';
    });

    const reviewEntries = SCHEDULE.weeks.filter(function (w) {
      const r = state.reviews[w.key];
      return r && (r.done || r.note);
    });
    md += '## 二、每周复盘\n\n';
    if (!reviewEntries.length) md += '还没有填写周复盘。\n\n';
    reviewEntries.forEach(function (w) {
      const r = state.reviews[w.key];
      md += '### 第 ' + w.number + ' 周\n\n';
      md += '> ' + (r.note ? r.note.replace(/\n/g, '\n> ') : '已完成复盘，未填写文字。') + '\n\n';
    });

    md += '## 三、课程简介与练习重点\n\n';
    LESSONS.forEach(function (l) {
      const d = lessonDate(l.id);
      const done = isDone(l.id);
      md += '### P' + pad2(l.part) + ' · ' + l.title + '\n\n';
      md += '- ' + STAGES[l.stage].name + ' · 编号 ' + l.no + ' · 视频 ' + fmtDuration(l.seconds) + (d ? ' · 计划 ' + fmtShort(d) : '') + ' · ' + (done ? '已完成' : '未完成') + '\n';
      md += '- 简介：' + l.summary + '\n';
      md += '- 练习重点：' + l.practice + '\n\n';
    });

    md += '---\n\n课程目录来自 B 站合集 ' + COURSE_DATA.bvid + '。简介与练习建议为学习计划整理，具体以视频讲解为准。\n';
    return md;
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
  }

  function exportDoc() {
    clearTimeout(saveTimer); saveTimer = null; persist();
    download('竹笛学习计划_' + todayKey() + '.doc', '\ufeff' + buildDocHTML(), 'application/msword');
    toast('Word 文档已生成');
  }

  function exportMD() {
    clearTimeout(saveTimer); saveTimer = null; persist();
    download('竹笛学习计划_' + todayKey() + '.md', buildMarkdown(), 'text/markdown');
    toast('Markdown 已生成');
  }

  function printDoc() {
    clearTimeout(saveTimer); saveTimer = null;
    persist();
    if (openModal) closeModal();
    const root = $('#printRoot');
    root.innerHTML = '<div class="doc">' + buildDocBody() + '</div>';
    window.print();
  }

  function exportJSON() {
    download('竹笛学习计划_备份_' + todayKey() + '.json', JSON.stringify(state, null, 2), 'application/json');
    toast('备份文件已生成');
  }

  function importJSONFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object' || !data.settings || !data.progress) throw new Error('bad');
        if (!confirm('导入备份会覆盖当前所有完成记录和笔记，确定继续吗？')) return;
        state = normalizeState(data);
        rebuild();
        persist();
        render();
        toast('备份已导入');
      } catch (e) {
        toast('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  /* ---------- toast ---------- */

  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------- events ---------- */

  function onClick(e) {
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
      closeModal();
      return;
    }
    const el = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!el) return;
    const action = el.getAttribute('data-action');
    const id = el.getAttribute('data-id');
    const week = el.getAttribute('data-week');

    switch (action) {
      case 'start-today': startToday(); break;
      case 'open-lesson': openLessonModal(id); break;
      case 'close-modal': closeModal(); break;
      case 'toggle-watched': toggleField(id, 'watched'); break;
      case 'toggle-practiced': toggleField(id, 'practiced'); break;
      case 'toggle-done': toggleDone(id); break;
      case 'open-review': openReviewModal(week); break;
      case 'toggle-review': toggleReview(week); break;
      case 'filter-stage':
        courseStage = el.getAttribute('data-stage');
        render({ keepScroll: true });
        break;
      case 'toggle-hide-done':
        hideDone = !hideDone;
        render({ keepScroll: true });
        break;
      case 'export-doc': exportDoc(); break;
      case 'export-md': exportMD(); break;
      case 'print-doc': printDoc(); break;
      case 'export-json': exportJSON(); break;
      case 'import-json':
        const input = $('#importFile');
        if (input) input.click();
        break;
      case 'reset': resetAll(); break;
      default: break;
    }
  }

  function onInput(e) {
    const t = e.target;
    if (!t) return;
    if (t.id === 'courseSearch') {
      courseQuery = t.value.trim();
      renderLessonList();
      return;
    }
    if (t.matches && t.matches('[data-note]')) {
      const id = t.getAttribute('data-id');
      const field = t.getAttribute('data-note');
      if (!state.notes[id]) state.notes[id] = {};
      state.notes[id][field] = t.value;
      state.notes[id].updatedAt = new Date().toISOString();
      saveSoon();
      return;
    }
    if (t.matches && t.matches('[data-review-note]')) {
      const week = t.getAttribute('data-review-note');
      if (!state.reviews[week]) state.reviews[week] = {};
      state.reviews[week].note = t.value;
      state.reviews[week].updatedAt = new Date().toISOString();
      saveSoon();
    }
  }

  function onChange(e) {
    if (e.target.id === 'startDate') {
      changeStartDate(e.target.value);
      return;
    }
    if (e.target.id === 'importFile') {
      importJSONFile(e.target.files && e.target.files[0]);
      e.target.value = '';
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape' && openModal) {
      closeModal();
      return;
    }
    if (e.key === 'Tab' && openModal) {
      const focusables = $$('.modal button, .modal textarea, .modal input, .modal a[href]');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function bind() {
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('hashchange', function () {
      if (location.hash === '#main') return;  // 「跳到主要内容」锚点不触发视图重渲染
      if (openModal) {
        $('#modalRoot').innerHTML = '';
        document.body.classList.remove('modal-open');
        openModal = null;
      }
      render();
    });
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY) {
        state = loadState();
        rebuild();
        render({ keepScroll: true });
        toast('已同步其他标签页的修改');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
        persist();
      }
    });
  }

  function init() {
    state = loadState();
    rebuild();
    bind();
    render();
  }

  if (typeof document !== 'undefined') init();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildSchedule: buildSchedule,
      defaultStartDate: defaultStartDate,
      ymd: ymd,
      addDays: addDays,
      parseYMD: parseYMD
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
