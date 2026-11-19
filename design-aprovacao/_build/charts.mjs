// Gráficos SVG simples. Cores vêm de classes CSS (.bar, .line, .area, .seg-1..3), não de hex.
const fmt = (n) => Number(n.toFixed(1));

/** Mini-gráfico de linha sem eixos. */
export function spark(values, w = 120, h = 36, label = 'Tendência') {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values
    .map((v, i) => `${fmt((i / (values.length - 1)) * (w - 4) + 2)},${fmt(h - 2 - ((v - min) / (max - min || 1)) * (h - 4))}`)
    .join(' ');
  return `<svg class="chart spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}"><polyline class="line" points="${pts}"/></svg>`;
}

/** Barras verticais com rótulos; a última barra recebe a classe bar--hi. */
export function bars(values, labels, { w = 420, h = 190, unit = '' } = {}) {
  const pad = 26;
  const max = Math.max(...values);
  const slot = (w - 8) / values.length;
  const bw = slot * 0.56;
  const cols = values
    .map((v, i) => {
      const bh = ((h - pad - 14) * v) / max;
      const x = 4 + i * slot + (slot - bw) / 2;
      const y = h - pad - bh;
      const hi = i === values.length - 1 ? ' bar--hi' : '';
      return `<rect class="bar${hi}" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(bw)}" height="${fmt(bh)}" rx="4"/><text class="axis" x="${fmt(x + bw / 2)}" y="${h - 8}" text-anchor="middle">${labels[i]}</text>`;
    })
    .join('');
  return `<svg class="chart bars" viewBox="0 0 ${w} ${h}" role="img" aria-label="Gráfico de barras ${unit}">${cols}</svg>`;
}

/** Linha com área, grade e rótulos no eixo X. */
export function lineChart(values, labels, { w = 520, h = 210, min, max } = {}) {
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const padX = 18;
  const top = 16;
  const bottom = 28;
  const xs = values.map((_, i) => padX + (i / (values.length - 1)) * (w - padX * 2));
  const ys = values.map((v) => top + (1 - (v - lo) / (hi - lo || 1)) * (h - top - bottom));
  const pts = xs.map((x, i) => `${fmt(x)},${fmt(ys[i])}`).join(' ');
  const area = `${fmt(xs[0])},${h - bottom} ${pts} ${fmt(xs[xs.length - 1])},${h - bottom}`;
  const grid = [0, 1, 2, 3].map((g) => `<line class="grid-line" x1="${padX}" x2="${w - padX}" y1="${top + (g * (h - top - bottom)) / 3}" y2="${top + (g * (h - top - bottom)) / 3}"/>`).join('');
  const dots = xs.map((x, i) => `<circle class="dot" cx="${fmt(x)}" cy="${fmt(ys[i])}" r="3.5"/>`).join('');
  const text = xs.map((x, i) => `<text class="axis" x="${fmt(x)}" y="${h - 8}" text-anchor="middle">${labels[i]}</text>`).join('');
  return `<svg class="chart line-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolução em ${labels.length} meses">${grid}<polygon class="area" points="${area}"/><polyline class="line" points="${pts}"/>${dots}${text}</svg>`;
}

/** Duas séries com escalas independentes (ex.: Peso kg e % Gordura), como o gráfico do prontuário. */
export function dualLine(a, b, labels, { w = 560, h = 230 } = {}) {
  const padX = 22;
  const top = 16;
  const bottom = 28;
  const xs = a.map((_, i) => padX + (i / (a.length - 1)) * (w - padX * 2));
  const scale = (vals) => {
    const lo = Math.min(...vals) - 0.4 * (Math.max(...vals) - Math.min(...vals) || 1);
    const hi = Math.max(...vals) + 0.4 * (Math.max(...vals) - Math.min(...vals) || 1);
    return vals.map((v) => top + (1 - (v - lo) / (hi - lo)) * (h - top - bottom));
  };
  const ya = scale(a);
  const yb = scale(b);
  const pts = (ys) => xs.map((x, i) => `${fmt(x)},${fmt(ys[i])}`).join(' ');
  const grid = [0, 1, 2, 3].map((g) => `<line class="grid-line" x1="${padX}" x2="${w - padX}" y1="${top + (g * (h - top - bottom)) / 3}" y2="${top + (g * (h - top - bottom)) / 3}"/>`).join('');
  const dots = (ys, cls) => xs.map((x, i) => `<circle class="dot ${cls}" cx="${fmt(x)}" cy="${fmt(ys[i])}" r="3.5"/>`).join('');
  const text = xs.map((x, i) => `<text class="axis" x="${fmt(x)}" y="${h - 8}" text-anchor="middle">${labels[i]}</text>`).join('');
  return `<svg class="chart line-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolução de peso e percentual de gordura">${grid}<polyline class="line" points="${pts(ya)}"/><polyline class="line line-2" points="${pts(yb)}"/>${dots(ya, '')}${dots(yb, 'dot-2')}${text}</svg>`;
}

/** Anel de progresso (ex.: Performance do dia). */
export function ring(pct, { size = 92 } = {}) {
  const r = 40;
  const C = 2 * Math.PI * r;
  return `<svg class="chart ring" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${pct}% concluído"><circle class="ring-track" cx="50" cy="50" r="${r}"/><circle class="ring-fill" cx="50" cy="50" r="${r}" stroke-dasharray="${fmt((C * pct) / 100)} ${fmt(C)}" transform="rotate(-90 50 50)"/><text class="ring-num" x="50" y="56" text-anchor="middle">${pct}%</text></svg>`;
}

/** Rosca de macronutrientes: parts = [{pct, label}] somando 100. */
export function donut(parts, center) {
  const r = 52;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const segs = parts
    .map((p, i) => {
      const len = (C * p.pct) / 100;
      const seg = `<circle class="seg seg-${i + 1}" cx="70" cy="70" r="${r}" stroke-dasharray="${fmt(len - 2)} ${fmt(C - len + 2)}" stroke-dashoffset="${fmt(-offset)}"/>`;
      offset += len;
      return seg;
    })
    .join('');
  return `<svg class="chart donut" viewBox="0 0 140 140" role="img" aria-label="Distribuição de macros"><g transform="rotate(-90 70 70)">${segs}</g><text class="donut-num" x="70" y="68" text-anchor="middle">${center.value}</text><text class="axis" x="70" y="86" text-anchor="middle">${center.label}</text></svg>`;
}
