/*
 * tester.js - calls each Adoptions API route with fetch() and shows the result.
 */
document.addEventListener('DOMContentLoaded', () => {
  const baseInput = document.querySelector('#base-url');

  // If the page is served by the API itself, default to that origin.
  if (location.protocol.startsWith('http')) baseInput.value = location.origin;

  const base = () => baseInput.value.replace(/\/+$/, '');

  const routes = {
    all: () => '/api/adoptions',
    single: () => `/api/adoptions/${document.querySelector('#adoption-id').value}`,
    university: () => `/api/adoptions/university/${document.querySelector('#university-id').value}`
  };

  // fetch() wrapper: returns status, timing and parsed JSON
  async function callApi(path) {
    const started = performance.now();
    const response = await fetch(base() + path, { headers: { Accept: 'application/json' } });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data, ms: Math.round(performance.now() - started) };
  }

  // Build a summary table from one adoption or an array of adoptions
  function buildTable(data, captionText) {
    const rows = Array.isArray(data) ? data : [data];
    const table = document.createElement('table');
    table.createCaption().textContent = captionText;
    const head = table.createTHead().insertRow();
    ['AdoptionID', 'Date', 'University', 'Course', 'Books'].forEach(text => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = text;
      head.appendChild(th);
    });
    const body = table.createTBody();
    rows.forEach(a => {
      const tr = body.insertRow();
      [
        a.AdoptionID,
        a.AdoptionDate,
        `${a.University.Name} (${a.UniversityID})`,
        a.CourseCode,
        a.Books.map(b => `${b.Title} ×${b.Quantity}`).join('; ')
      ].forEach(value => { tr.insertCell().textContent = value; });
    });
    return table;
  }

  // Render formatted JSON with accessible palette-matched token styling
  const jsonTokenRe = /("(?:\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

  function renderJson(container, data) {
    const text = JSON.stringify(data, null, 2);
    const frag = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of text.matchAll(jsonTokenRe)) {
      const index = match.index;
      if (index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, index)));
      }

      const token = match[0];
      const colonPart = match[2];

      if (token.startsWith('"') && colonPart) {
        const span = document.createElement('span');
        span.className = 'json-key';
        span.textContent = token.slice(0, -colonPart.length);
        frag.appendChild(span);
        frag.appendChild(document.createTextNode(colonPart));
      } else if (!token.startsWith('"')) {
        const span = document.createElement('span');
        span.className = 'json-val';
        span.textContent = token;
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(token));
      }

      lastIndex = index + token.length;
    }

    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    container.replaceChildren(frag);
  }

  // Run one route and fill in its card
  async function runRoute(name) {
    const card = document.getElementById(name);
    const status = card.querySelector('.status');
    const wrap = card.querySelector('.table-wrap');
    const output = card.querySelector('.output');
    const path = routes[name]();

    status.className = 'status';
    status.textContent = `Fetching ${path} …`;
    wrap.replaceChildren();
    output.replaceChildren();

    try {
      const result = await callApi(path);
      renderJson(output, result.data);
      if (!result.ok) {
        status.classList.add('fail');
        status.textContent = `HTTP ${result.status}: ${result.data.error}`;
        return;
      }
      const count = Array.isArray(result.data) ? result.data.length : 1;
      status.classList.add('ok');
      status.textContent = `HTTP ${result.status} – ${count} adoption(s) in ${result.ms} ms`;
      wrap.appendChild(buildTable(result.data, `Response from GET ${path}`));
    } catch (err) {
      status.classList.add('fail');
      status.textContent = `Request failed: ${err.message}. Is the API running at ${base()}?`;
    }
  }

  document.querySelector('button[data-route="all"]').addEventListener('click', () => runRoute('all'));
  document.querySelectorAll('form[data-route]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      runRoute(form.dataset.route);
    });
  });

  // Quick copy and collapse actions for Raw JSON panels
  document.querySelectorAll('button[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const details = btn.closest('details');
      const text = details.querySelector('.output').textContent;
      if (!text) {
        btn.textContent = 'No JSON yet';
        setTimeout(() => { btn.textContent = 'Copy JSON'; }, 1500);
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
      } catch {
        btn.textContent = 'Copy failed';
      }
      setTimeout(() => { btn.textContent = 'Copy JSON'; }, 1500);
    });
  });

  document.querySelectorAll('button[data-collapse]').forEach(btn => {
    btn.addEventListener('click', () => {
      const details = btn.closest('details');
      details.open = false;
      const summary = details.querySelector('summary');
      if (summary) summary.focus();
    });
  });

  // ---- Automated checks ------------------------------------------------------
  const isSortedByDate = list => list.every((a, i) => i === 0 || list[i - 1].AdoptionDate <= a.AdoptionDate);

  const checks = [
    ['GET /api/adoptions returns a non-empty array sorted by AdoptionDate', async () => {
      const r = await callApi('/api/adoptions');
      return r.ok && Array.isArray(r.data) && r.data.length > 0 && isSortedByDate(r.data);
    }],
    ['GET /api/adoptions/14 returns the adoption with AdoptionID 14', async () => {
      const r = await callApi('/api/adoptions/14');
      return r.ok && !Array.isArray(r.data) && r.data.AdoptionID === 14;
    }],
    ['GET /api/adoptions/university/100724 returns only UniversityID 100724', async () => {
      const r = await callApi('/api/adoptions/university/100724');
      return r.ok && r.data.length > 0 && r.data.every(a => a.UniversityID === 100724);
    }],
    ['GET /api/adoptions/9999 returns 404 for a missing adoption', async () => {
      const r = await callApi('/api/adoptions/9999');
      return r.status === 404;
    }],
    ['GET /api/adoptions/abc returns 400 for a non-numeric id', async () => {
      const r = await callApi('/api/adoptions/abc');
      return r.status === 400;
    }]
  ];

  document.querySelector('#run-all').addEventListener('click', async () => {
    const list = document.querySelector('.checks');
    list.replaceChildren();
    for (const [label, test] of checks) {
      const li = document.createElement('li');
      let passed = false;
      try { passed = await test(); } catch { passed = false; }
      li.className = passed ? 'pass' : 'fail';
      li.textContent = label;
      list.appendChild(li);
    }
  });
});
