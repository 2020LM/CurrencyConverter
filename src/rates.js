export async function fetchRates(base) {
  const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
  if (!response.ok) {
    throw new Error(`Exchange-rate service returned HTTP ${response.status}.`);
  }

  const data = await response.json();
  if (data.result !== 'success' || data.base_code !== base || !data.rates || typeof data.rates !== 'object') {
    throw new Error('Exchange-rate service returned invalid data.');
  }
  return data;
}

export function errorMessage(error) {
  return error?.message || 'Unable to fetch exchange rates.';
}
