const fileElem = document.getElementById('fileElem');
const dropArea = document.getElementById('drop-area');
const output = document.getElementById('ascii-output');

const widthSlider = document.getElementById('width');
const charsetSelect = document.getElementById('charset');
const invertCheckbox = document.getElementById('invert');
const fontSizeSlider = document.getElementById('fontsize');
const bgColorPicker = document.getElementById('bgcolor');
const copyBtn = document.getElementById('copy-btn');
const langSwitch = document.getElementById('lang-switch');

let imgData;

const i18n = {
  de: {
    title: 'ASCII Art Generator',
    dropText: '📥 Bild hierher ziehen, einfügen (STRG+V) oder klicken zum Hochladen',
    labelWidth: 'Breite:',
    labelCharset: 'Zeichensatz:',
    labelInvert: 'Farben invertieren',
    labelFontSize: 'Schriftgröße:',
    labelBgColor: 'Hintergrundfarbe:',
    copyBtn: '📋 ASCII kopieren'
  },
  en: {
    title: 'ASCII Art Generator',
    dropText: '📥 Drag, paste (CTRL+V) or click to upload an image',
    labelWidth: 'Width:',
    labelCharset: 'Charset:',
    labelInvert: 'Invert colors',
    labelFontSize: 'Font size:',
    labelBgColor: 'Background color:',
    copyBtn: '📋 Copy ASCII'
  }
};

function setLanguage(lang) {
  const t = i18n[lang];
  document.getElementById('title').textContent = t.title;
  document.getElementById('drop-text').textContent = t.dropText;
  document.getElementById('label-width').childNodes[0].textContent = t.labelWidth;
  document.getElementById('label-charset').childNodes[0].textContent = t.labelCharset;
  document.getElementById('label-invert').textContent = t.labelInvert;
  document.getElementById('label-fontsize').childNodes[0].textContent = t.labelFontSize;
  document.getElementById('label-bgcolor').childNodes[0].textContent = t.labelBgColor;
  document.getElementById('copy-btn').textContent = t.copyBtn;
  localStorage.setItem('lang', lang);
}

function loadLanguage() {
  const savedLang = localStorage.getItem('lang');
  const browserLang = navigator.language.startsWith('de') ? 'de' : 'en';
  const lang = savedLang || browserLang;
  langSwitch.value = lang;
  setLanguage(lang);
}

langSwitch.addEventListener('change', () => setLanguage(langSwitch.value));

dropArea.addEventListener('click', () => fileElem.click());
fileElem.addEventListener('change', handleFiles);
document.addEventListener('paste', e => {
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image')) {
      const file = item.getAsFile();
      processImage(file);
    }
  }
});

dropArea.addEventListener('dragover', e => e.preventDefault());
dropArea.addEventListener('drop', e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  processImage(file);
});

[widthSlider, charsetSelect, invertCheckbox, fontSizeSlider, bgColorPicker].forEach(input =>
  input.addEventListener('input', () => {
    saveSettings();
    updateAscii();
  })
);

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(output.textContent).then(() => {
    copyBtn.textContent = '✅ Kopiert!';
    setTimeout(() => copyBtn.textContent = i18n[langSwitch.value].copyBtn, 2000);
  });
});

function handleFiles() {
  const file = fileElem.files[0];
  if (file) processImage(file);
}

function processImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const desiredWidth = parseInt(widthSlider.value);
      const aspectRatio = 0.55; // Korrekturfaktor: Breite zu Höhe eines Zeichens
      const scale = desiredWidth / img.width;
      canvas.width = desiredWidth;
      canvas.height = img.height * scale * aspectRatio;

      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      imgData = context.getImageData(0, 0, canvas.width, canvas.height);
      updateAscii();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function updateAscii() {
  if (!imgData) return;
  const chars = charsetSelect.value;
  const invert = invertCheckbox.checked;
  const fontSize = fontSizeSlider.value;
  const bgColor = bgColorPicker.value;
  document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
  document.documentElement.style.setProperty('--bg-color', bgColor);

  let ascii = '';
  const data = imgData.data;
  const width = imgData.width;

  for (let y = 0; y < imgData.height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (invert) gray = 255 - gray;
      const charIndex = Math.floor((gray / 255) * (chars.length - 1));
      ascii += chars[charIndex];
    }
    ascii += '\n';
  }

  output.textContent = ascii;
}

function saveSettings() {
  localStorage.setItem('settings', JSON.stringify({

  }));
}

function loadSettings() {
  const s = JSON.parse(localStorage.getItem('settings') || '{}');

  updateAscii();
}

loadLanguage();
loadSettings();
