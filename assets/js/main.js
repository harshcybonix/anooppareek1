const path = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('nav a').forEach((a) => {
  const href = a.getAttribute('href');
  if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
});

const revealTargets = document.querySelectorAll('section, .card, .highlight, .conversion-panel, .page-title');
revealTargets.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach((el) => observer.observe(el));

const form = document.getElementById('consultation-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const subject = encodeURIComponent(`Consultation Request - ${data.name}`);
    const body = encodeURIComponent(`Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nCity: ${data.city}\nMessage: ${data.message}`);

    location.href = `mailto:advocate.anooppareek@yahoo.com?subject=${subject}&body=${body}`;
    const status = document.getElementById('status');
    if (status) status.textContent = 'Opening your email app to send request. For instant help, use WhatsApp.';
  });
}

if (window.innerWidth <= 720) {
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;background:#0b1c47;padding:.5rem;display:flex;gap:.5rem;z-index:120;border-top:1px solid rgba(201,165,87,.35)';
  bar.innerHTML = '<a href="tel:+919414207040" style="flex:1;text-align:center;background:linear-gradient(135deg,#e2c888,#c39943);color:#1a1a1a;font-weight:800;border-radius:999px;padding:.62rem .5rem;text-decoration:none">Call Now</a><a href="https://wa.me/919414207040" target="_blank" style="flex:1;text-align:center;background:linear-gradient(135deg,#149052,#1aa960);color:#fff;font-weight:800;border-radius:999px;padding:.62rem .5rem;text-decoration:none">WhatsApp</a>';
  document.body.appendChild(bar);
}

const kb = [
  {
    intents: ['bail', 'anticipatory bail', 'regular bail', 'arrest'],
    answer: 'For bail matters, immediate filing strategy is critical. Keep FIR details, case number, and previous order copies ready. For urgent assistance, call 09414207040 or use WhatsApp for priority response.'
  },
  {
    intents: ['property', 'land dispute', 'partition', 'title', 'registry'],
    answer: 'Property disputes usually require title-document verification first, then notice or injunction planning. Bring sale deed, mutation records, and possession proof for proper legal review.'
  },
  {
    intents: ['cheque bounce', '138', 'ni act'],
    answer: 'Cheque bounce cases under Section 138 NI Act depend on statutory timelines. Keep cheque copy, return memo, and legal notice details ready for case assessment.'
  },
  {
    intents: ['divorce', 'family', 'maintenance', 'custody'],
    answer: 'Family matters need fact-based strategy and documentation. A consultation helps determine whether negotiation, mediation, or litigation is most suitable.'
  },
  {
    intents: ['fees', 'cost', 'charges'],
    answer: 'Legal fees depend on case nature, stage, urgency, and court level. Share your matter briefly to receive an appropriate consultation estimate.'
  },
  {
    intents: ['appointment', 'consultation', 'book', 'meeting'],
    answer: 'You can book consultation from the Consultation page or directly via WhatsApp for faster slot confirmation.'
  }
];

function bestMatch(query) {
  const q = query.toLowerCase();
  let best = null;
  let score = 0;
  kb.forEach((item) => {
    const s = item.intents.reduce((acc, word) => acc + (q.includes(word) ? 1 : 0), 0);
    if (s > score) {
      score = s;
      best = item;
    }
  });
  if (best && score > 0) return best.answer;
  return 'I can help with bail, property disputes, cheque bounce, family law, civil/criminal litigation, and consultation steps. Ask a specific legal question and I will guide you.';
}

async function askOpenAI(apiKey, userText) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: 'You are a legal website assistant for Advocate Anoop Pareek in Jaipur. Give practical, concise guidance, include a disclaimer that this is general information and not a substitute for legal representation, and suggest contacting the office for case-specific advice.'
        },
        {
          role: 'user',
          content: userText
        }
      ]
    })
  });

  if (!response.ok) throw new Error('AI response failed');
  const data = await response.json();
  return data.output_text || 'AI response received. Please contact the office for case-specific legal advice.';
}

(function initChatbot() {
  const launcher = document.createElement('button');
  launcher.className = 'chat-launcher';
  launcher.textContent = 'AI Legal Chat';

  const panel = document.createElement('section');
  panel.className = 'chatbot';
  panel.innerHTML = `
    <div class="chat-head">
      <span>AI Legal Assistant</span>
      <button type="button" aria-label="Close">✕</button>
    </div>
    <div class="chat-log" id="chat-log">
      <div class="msg bot">Welcome. Ask your legal question (bail, property, cheque bounce, family law, civil/criminal matters). This is general guidance, not legal representation.</div>
    </div>
    <div class="chat-tools">
      <div class="row">
        <select id="ai-mode">
          <option value="smart">Smart FAQ AI (Built-in)</option>
          <option value="live">Live AI (Use your API key)</option>
        </select>
      </div>
      <div class="row"><input id="api-key" type="password" placeholder="Optional: OpenAI API key for Live AI" /></div>
      <div class="row"><input id="chat-input" type="text" placeholder="Type your legal question" /></div>
      <div class="row"><button id="send-chat" type="button">Send</button></div>
      <div class="chat-note">For urgent matters call <a href="tel:+919414207040">09414207040</a> or <a href="https://wa.me/919414207040" target="_blank">WhatsApp</a>.</div>
    </div>`;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const closeBtn = panel.querySelector('.chat-head button');
  const chatLog = panel.querySelector('#chat-log');
  const mode = panel.querySelector('#ai-mode');
  const apiInput = panel.querySelector('#api-key');
  const input = panel.querySelector('#chat-input');
  const sendBtn = panel.querySelector('#send-chat');

  const saved = localStorage.getItem('ap_chat_api_key');
  if (saved) apiInput.value = saved;

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';

    try {
      if (mode.value === 'live') {
        const key = apiInput.value.trim();
        if (!key) {
          addMsg('Please add your API key for Live AI mode, or switch to Smart FAQ AI.', 'bot');
          return;
        }
        localStorage.setItem('ap_chat_api_key', key);
        addMsg('Thinking...', 'bot');
        const thinking = chatLog.lastElementChild;
        const aiText = await askOpenAI(key, text);
        thinking.textContent = `${aiText} (General info only. For legal representation, contact Advocate Anoop Pareek.)`;
      } else {
        const reply = bestMatch(text);
        addMsg(`${reply} (General information only. For case-specific advice, contact Advocate Anoop Pareek.)`, 'bot');
      }
    } catch (_e) {
      addMsg('Live AI is currently unavailable. Please use Smart FAQ mode or contact the office directly.', 'bot');
    }
  }

  launcher.addEventListener('click', () => panel.classList.toggle('open'));
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
})();
