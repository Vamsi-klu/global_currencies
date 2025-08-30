document.addEventListener('DOMContentLoaded', () => {
  const askBtn = document.getElementById('ask-btn');
  const stopBtn = document.getElementById('stop-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const speakBtn = document.getElementById('speak-btn');
  const demoBtn = document.getElementById('demo-btn');

  const aiQuestion = document.getElementById('ai-question');
  const aiOutput = document.getElementById('ai-output');
  const aiStatus = document.getElementById('ai-status');
  const minBulletsEl = document.getElementById('min-bullets');
  const styleSelect = document.getElementById('style-select');
  const detailRange = document.getElementById('detail-range');

  const settingsOpen = document.getElementById('settingsOpen');
  const settingsModal = createSettingsModal();
  document.body.appendChild(settingsModal.container);
  settingsOpen?.addEventListener('click', settingsModal.open);

  let aborter = null;

  askBtn?.addEventListener('click', async () => {
    const q = (aiQuestion?.value || '').trim();
    if (!q) return flashStatus('Please enter a question.', true);
    const minBullets = Math.max(10, parseInt(minBulletsEl.value || '10', 10));
    const style = styleSelect.value; const detail = parseInt(detailRange.value, 10);
    aiOutput.innerHTML = ''; setLoading(true); aborter = new AbortController();
    try {
      const points = await fetchAI({ question: q, minBullets, style, detail, signal: aborter.signal });
      renderPoints(points); flashStatus(`Generated ${points.length} bullet points.`);
    } catch (err) {
      if (err.name === 'AbortError') flashStatus('Generation stopped.');
      else { console.error(err); flashStatus('Failed to generate insights. See console.', true); }
    } finally { setLoading(false); aborter = null; }
  });

  stopBtn?.addEventListener('click', () => aborter?.abort());
  clearBtn?.addEventListener('click', () => { aiQuestion.value=''; aiOutput.innerHTML=''; flashStatus('Cleared.'); });
  copyBtn?.addEventListener('click', async () => {
    const text = pointsToMarkdown(collectPoints()); if (!text.trim()) return flashStatus('Nothing to copy.', true);
    await navigator.clipboard.writeText(text); flashStatus('Copied to clipboard.');
  });
  downloadBtn?.addEventListener('click', () => {
    const points = collectPoints(); if (!points.length) return flashStatus('Nothing to download.', true);
    const blob = new Blob([JSON.stringify({ points }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='ai_insights.json'; a.click(); URL.revokeObjectURL(url);
  });
  speakBtn?.addEventListener('click', () => {
    const text = pointsToPlain(collectPoints()); if (!text.trim()) return flashStatus('Nothing to speak.', true);
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  });
  demoBtn?.addEventListener('click', () => { renderPoints(buildDemoPoints(Math.max(10, parseInt(minBulletsEl.value||'10',10)))); flashStatus('Demo loaded.'); });

  function setLoading(isLoading){ askBtn.disabled=isLoading; stopBtn.disabled=!isLoading; askBtn.classList.toggle('opacity-60',isLoading); aiStatus.classList.toggle('hidden',!isLoading); if(isLoading) aiStatus.textContent='Thinking… generating bullet points…'; }
  function flashStatus(msg,err=false){ aiStatus.classList.remove('hidden'); aiStatus.textContent=msg; aiStatus.classList.toggle('text-red-600',err); aiStatus.classList.toggle('dark:text-red-400',err); if(!err) setTimeout(()=>aiStatus.classList.add('hidden'),2000); }
  function renderPoints(points){ const list=document.createElement('ol'); list.className='list-decimal pl-6 space-y-3 text-slate-800 dark:text-slate-100'; points.forEach((p,i)=>{ const li=document.createElement('li'); const t=document.createElement('div'); t.className='font-semibold'; t.textContent=p.title||`Point ${i+1}`; const b=document.createElement('div'); b.className='text-slate-600 dark:text-slate-300'; b.textContent=p.explanation||''; li.appendChild(t); if(p.explanation) li.appendChild(b); list.appendChild(li); }); aiOutput.innerHTML=''; aiOutput.appendChild(list); aiOutput.dataset.points=JSON.stringify(points); }
  function collectPoints(){ try {return JSON.parse(aiOutput.dataset.points||'[]');} catch {return [];} }
  function pointsToMarkdown(points){ return points.map((p,i)=>`- ${p.title||`Point ${i+1}`}\n  - ${p.explanation||''}`).join('\n'); }
  function pointsToPlain(points){ return points.map((p,i)=>`${i+1}. ${p.title}\n${p.explanation}`).join('\n\n'); }

  async function fetchAI({ question, minBullets, style, detail, signal }){
    // Try server proxy first
    try {
      const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, signal, body: JSON.stringify({ question, minBullets, style, detail }) });
      if (res.ok) { const json = await res.json(); if (Array.isArray(json.points)) return ensureMin(json.points, minBullets); }
    } catch (_) { /* ignore and try client */ }

    // Fallback to client-side OpenAI (testing only)
    const apiKey = localStorage.getItem('OPENAI_API_KEY') || '';
    if (!apiKey) throw new Error('No server and no API key set');
    const styleMap = { concise: 'concise but complete', balanced: 'balanced length', 'in-depth': 'deep, thorough' };
    const sys = `You are an expert analyst of money, macroeconomics, and currencies. Produce clear, factual, organized guidance.`;
    const userInstruction = `Task: Answer the user question as an ordered list of at least ${minBullets} bullet points. Each point must contain a short title and a well-explained 1-3 sentence explanation. Style should be ${styleMap[style] || 'balanced'}. Detail level: ${detail}/3. Return ONLY valid JSON with this exact shape:\n{ "points": [ { "title": string, "explanation": string } ] }\nDo not include any extra keys or prose.`;
    const body = { model: localStorage.getItem('OPENAI_MODEL') || 'gpt-4o-mini', messages: [ { role:'system', content: sys }, { role:'user', content: `${userInstruction}\n\nUser question: ${question}` } ], temperature: 0.6, response_format: { type:'json_object' } };
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`}, body: JSON.stringify(body), signal });
    if (!res.ok) { const t = await res.text(); throw new Error(`OpenAI error ${res.status}: ${t}`); }
    const json = await res.json(); let content = json?.choices?.[0]?.message?.content || ''; let parsed; try { parsed=JSON.parse(content);} catch { parsed={ points: parseFallbackToPoints(content, minBullets) }; }
    const pts = Array.isArray(parsed.points) ? parsed.points : []; return ensureMin(pts, minBullets);
  }

  function parseFallbackToPoints(text, minBullets){ const lines=text.split(/\r?\n/).filter(Boolean); const bullets=[]; for(const ln of lines){ const m=ln.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/); if(m) bullets.push(m[1].trim()); } const result=bullets.slice(0, Math.max(minBullets, bullets.length)).map((t,i)=>({ title:t.split(':')[0]||`Point ${i+1}`, explanation: t.includes(':')? t.split(':').slice(1).join(':').trim(): '' })); return result.length? result: [{ title:'Summary', explanation:text }]; }
  function ensureMin(points, n){ const out=[...points]; while(out.length<n){ out.push({ title:`Additional consideration ${out.length+1}`, explanation:'Add more detail specific to the user context.'}); } return out; }

  function buildDemoPoints(n){
    const base=[
      { title:'Monetary policy impact', explanation:'Interest rate changes influence capital flows and exchange rates via carry trades and relative yield attractiveness.'},
      { title:'Inflation differentials', explanation:'Higher inflation erodes purchasing power and typically weakens a currency over time versus trading partners.'},
      { title:'Trade balances', explanation:'Persistent current account deficits can pressure a currency; surpluses can support it through demand for exports.'},
      { title:'Risk sentiment', explanation:'Global risk-on/off cycles drive flows into safe havens (USD, JPY, CHF) or higher-yielding EM currencies.'},
      { title:'Commodity prices', explanation:'Exporters/importers of oil or metals see currencies move with terms-of-trade shocks (e.g., NOK, CAD, AUD).'},
      { title:'Political stability', explanation:'Elections, policy uncertainty, or sanctions can add risk premia and volatility to FX markets.'},
      { title:'External debt levels', explanation:'High FX-denominated debt raises rollover risk; depreciations can worsen debt burdens and amplify volatility.'},
      { title:'Central bank credibility', explanation:'Clear communication and anchored expectations reduce surprises; weak credibility magnifies market reactions.'},
      { title:'Liquidity and market depth', explanation:'Deep markets (USD/EUR) absorb shocks better than thinly traded pairs, moderating volatility.'},
      { title:'Speculative positioning', explanation:'Crowded trades can unwind quickly, causing sharp moves when sentiment turns or data disappoints.'}
    ];
    while(base.length<n){ base.push({ title:`Extra factor ${base.length+1}`, explanation:'Additional driver relevant to the user’s query context.'}); }
    return base.slice(0,n);
  }

  function createSettingsModal(){
    const container=document.createElement('div'); container.className='fixed inset-0 z-50 hidden';
    container.innerHTML=`
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-2xl border border-aurora-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-glow p-6">
          <h3 class="text-xl font-bold">Settings</h3>
          <div class="mt-4 space-y-4">
            <div>
              <label class="text-sm text-slate-600 dark:text-slate-300">OpenAI API Key (client fallback)</label>
              <input id="openai-key" type="password" placeholder="sk-..." class="mt-1 w-full rounded-lg border border-aurora-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 px-3 py-2" />
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Stored locally for testing only. Prefer the server proxy.</p>
            </div>
            <div>
              <label class="text-sm text-slate-600 dark:text-slate-300">Model</label>
              <select id="openai-model" class="mt-1 w-full rounded-lg border border-aurora-200/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 px-3 py-2">
                <option value="gpt-4o-mini">gpt-4o-mini (default)</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button id="settingsCancel" class="rounded-lg px-4 py-2 border border-aurora-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/40">Close</button>
            <button id="settingsSave" class="rounded-lg px-4 py-2 text-white bg-gradient-to-r from-aurora-600 to-blossom-600 shadow-glow">Save</button>
          </div>
        </div>
      </div>`;
    const keyEl = () => container.querySelector('#openai-key');
    const modelEl = () => container.querySelector('#openai-model');
    const open = () => { keyEl().value = localStorage.getItem('OPENAI_API_KEY') || ''; modelEl().value = localStorage.getItem('OPENAI_MODEL') || 'gpt-4o-mini'; container.classList.remove('hidden'); };
    const close = () => container.classList.add('hidden');
    container.addEventListener('click', (e) => { if (e.target === container) close(); });
    container.querySelector('#settingsCancel').addEventListener('click', close);
    container.querySelector('#settingsSave').addEventListener('click', () => {
      localStorage.setItem('OPENAI_API_KEY', keyEl().value.trim());
      localStorage.setItem('OPENAI_MODEL', modelEl().value);
      close();
    });
    return { container, open, close };
  }
});

