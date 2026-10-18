export function longitudinalFormula(slope, equivalent = false) {
  const factors = {
    flat: ['Plana', 'μ'],
    up: ['Ascendente', '(μ cos θ + sen θ)'],
    down: ['Descendente', '(μ cos θ − sen θ)']
  };
  const selected = factors[slope];
  if (!selected) throw Error('Pendiente inválida.');
  const [label, factor] = selected;
  return `${label}: ${equivalent ? 'vₑ' : 'vᵢ'} = √(${equivalent ? '' : 'v𝒇² + '}2gd${factor}).`;
}
