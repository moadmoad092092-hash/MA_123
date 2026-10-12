'use strict';

const $ = (id) => document.getElementById(id);
const toast = $('toast');
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

async function copyText(value) {
  if (!value) return notify('لا يوجد شيء لنسخه.');
  try {
    await navigator.clipboard.writeText(value);
    notify('تم النسخ بنجاح ✓');
  } catch {
    const helper = document.createElement('textarea');
    helper.value = value;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand('copy');
    helper.remove();
    notify(ok ? 'تم النسخ بنجاح ✓' : 'تعذّر النسخ؛ حدّد النص وانسخه يدويًا.');
  }
}

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', () => {
    const target = $(button.dataset.copy);
    if (target) copyText(target.value || target.textContent);
  });
});

$('menuToggle').addEventListener('click', () => $('nav').classList.toggle('open'));
$('nav').querySelectorAll('a').forEach(link => link.addEventListener('click', () => $('nav').classList.remove('open')));
$('year').textContent = new Date().getFullYear();

// Name styling: these are decorative Unicode variants; platform/game filters may reject some.
$('makeNames').addEventListener('click', () => {
  const name = $('nameInput').value.trim();
  const host = $('nameResults');
  host.replaceChildren();
  if (!name) { notify('اكتب اسمًا أولًا.'); return; }
  const variants = [
    `『${name}』`, `亗 ${name} 亗`, `꧁༺ ${name} ༻꧂`,
    `★彡 ${name} 彡★`, `乂 ${name} 乂`, `【${name}】`
  ];
  variants.forEach(value => {
    const row = document.createElement('div');
    row.className = 'result-row';
    const code = document.createElement('code');
    code.textContent = value;
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.textContent = 'نسخ';
    button.addEventListener('click', () => copyText(value));
    row.append(code, button);
    host.append(row);
  });
});

$('passLength').addEventListener('input', () => $('lengthValue').textContent = $('passLength').value);
$('makePassword').addEventListener('click', () => {
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  if ($('useUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if ($('useNumbers').checked) chars += '0123456789';
  if ($('useSymbols').checked) chars += '!@#$%^&*()-_=+[]{}?';
  if (chars.length === 26) { notify('فعّل خيارًا إضافيًا لكلمة مرور أقوى.'); return; }
  const length = Number($('passLength').value);
  const random = new Uint32Array(length);
  crypto.getRandomValues(random);
  $('passwordOutput').value = Array.from(random, n => chars[n % chars.length]).join('');
});

// Basic indentation helper for common Luau block keywords. It does not parse or validate Luau.
$('formatCode').addEventListener('click', () => {
  const source = $('codeInput').value;
  if (!source.trim()) { notify('الصق الكود أولًا.'); return; }
  let depth = 0;
  const out = source.split(/\r?\n/).map(original => {
    const line = original.trim();
    if (!line) return '';
    const closes = /^(end\b|until\b|else\b|elseif\b|}\s*[,;]?\s*$)/.test(line);
    if (closes) depth = Math.max(0, depth - 1);
    const formatted = '    '.repeat(depth) + line;
    const opens = /\b(then|do|function)\b/.test(line) || /^\b(repeat)\b/.test(line) || /^\s*if\b.*\bthen\s*$/.test(line);
    if (opens && !/\bend\s*$/.test(line) && !/\belseif\b/.test(line) && !/\belse\b/.test(line)) depth++;
    if (/^else\b/.test(line) || /^elseif\b/.test(line)) depth++;
    return formatted;
  }).join('\n');
  $('codeOutput').value = out;
  notify('تم التنسيق الأساسي. راجع الناتج يدويًا.');
});
$('clearCode').addEventListener('click', () => { $('codeInput').value = ''; $('codeOutput').value = ''; notify('تم مسح المحرر.'); });

// Text utilities
function updateTextStats() {
  const value = $('textInput').value;
  $('charCount').textContent = [...value].length;
  $('wordCount').textContent = value.trim() ? value.trim().split(/\s+/).length : 0;
}
$('textInput').addEventListener('input', updateTextStats);
$('toUpper').addEventListener('click', () => { $('textOutput').value = $('textInput').value.toLocaleUpperCase(); notify('تم التحويل.'); });
$('toLower').addEventListener('click', () => { $('textOutput').value = $('textInput').value.toLocaleLowerCase(); notify('تم التحويل.'); });
$('reverseText').addEventListener('click', () => { $('textOutput').value = [...$('textInput').value].reverse().join(''); notify('تم عكس النص.'); });

// Notes are stored locally in this browser only.
const NOTES_KEY = 'roblox_lab_notes_v1';
try { $('notesInput').value = localStorage.getItem(NOTES_KEY) || ''; } catch {}
$('saveNotes').addEventListener('click', () => {
  try {
    localStorage.setItem(NOTES_KEY, $('notesInput').value);
    $('notesStatus').textContent = 'تم حفظ الملاحظات على هذا الجهاز ✓';
    notify('تم حفظ الملاحظات.');
  } catch {
    $('notesStatus').textContent = 'تعذّر الحفظ في هذا المتصفح. انسخ الملاحظات للاحتفاظ بها.';
    notify('تعذّر الحفظ المحلي.');
  }
});
$('clearNotes').addEventListener('click', () => {
  $('notesInput').value = '';
  try { localStorage.removeItem(NOTES_KEY); } catch {}
  $('notesStatus').textContent = 'تم حذف الملاحظات المحلية.';
  notify('تم حذف الملاحظات.');
});
