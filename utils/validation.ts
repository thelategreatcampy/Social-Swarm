export const isValidPrice = (price: string): boolean => {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0;
};

export const isValidCommission = (rate: string): boolean => {
  const num = parseFloat(rate);
  return !isNaN(num) && num >= 5 && num <= 90;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http');
  } catch {
    return false;
  }
};