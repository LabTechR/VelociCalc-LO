export const G = 9.80665;
export const surfaces = [
  ['Asfalto seco', .70], ['Asfalto mojado', .45],
  ['Concreto hidráulico seco', .75], ['Concreto hidráulico mojado', .50],
  ['Terracería seca', .50], ['Terracería mojada', .30]
];
export function number(value, name, min, max) {
  if (value === '' || value == null || typeof value === 'boolean') throw Error(`${name}: introduce un número.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw Error(`${name}: debe estar entre ${min} y ${max}.`);
  return n;
}
export function effective(mu, slope = 'flat', angle = 0) {
  mu = number(mu, 'Coeficiente', .01, 2);
  if (!['flat', 'up', 'down'].includes(slope)) throw Error('Pendiente inválida.');
  const a = number(angle, 'Ángulo', 0, 45) * Math.PI / 180;
  if (slope === 'flat' && a !== 0) throw Error('La pendiente plana requiere ángulo cero.');
  const f = mu * Math.cos(a) + (slope === 'up' ? Math.sin(a) : slope === 'down' ? -Math.sin(a) : 0);
  if (f <= 0) throw Error('La pendiente supera la desaceleración disponible: no se puede estimar una detención con este modelo.');
  return f;
}
export function units(ms) { return { kmh: ms * 3.6, mph: ms / .44704 }; }
export function braking({distance, mu, slope = 'flat', angle = 0, finalSpeed = 0}) {
  const d = number(distance, 'Distancia', .01, 10000);
  const vf = number(finalSpeed, 'Velocidad final', 0, 500) / 3.6;
  return units(Math.sqrt(vf * vf + 2 * G * d * effective(mu, slope, angle)));
}
export function yaw({radius, mu, slope = 'flat', angle = 0}) {
  if (slope !== 'flat' || Number(angle) !== 0) throw Error('Yaw requiere calzada horizontal sin peralte; no se aplica la pendiente longitudinal del frenado.');
  return units(Math.sqrt(G * number(radius, 'Radio', .1, 10000) * number(mu, 'Coeficiente lateral', .01, 2)));
}
export function segments(rows, finalSpeed = 0) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 20) throw Error('Introduce de 1 a 20 tramos.');
  const vf = number(finalSpeed, 'Velocidad final', 0, 500) / 3.6;
  const work = rows.reduce((sum, r) => sum + number(r.distance, 'Distancia de tramo', .01, 10000) * effective(r.mu, r.slope, r.angle), 0);
  return units(Math.sqrt(vf * vf + 2 * G * work));
}
