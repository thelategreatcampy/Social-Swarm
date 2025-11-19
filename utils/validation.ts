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

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const formatCurrency = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * CSV Parsing Logic for Social Swarm
 * Heuristically detects columns for 'Code', 'Amount', and 'Order ID'
 */

export interface ImportedSale {
  code: string;
  amount: number;
  orderId: string;
  date?: string;
}

export const parseSalesCSV = async (file: File): Promise<ImportedSale[]> => {
  const text = await file.text();
  const lines = text.split(/\r\n|\n/);
  const headers = lines[0].split(',').map(h => h.toLowerCase().trim().replace(/["']/g, ''));

  // Heuristic Column Matching
  const codeIdx = headers.findIndex(h => h.includes('discount') || h.includes('code') || h.includes('ref') || h.includes('coupon'));
  const amountIdx = headers.findIndex(h => h.includes('total') || h.includes('price') || h.includes('amount') || h.includes('value'));
  const orderIdx = headers.findIndex(h => h.includes('order') || h.includes('id') || h.includes('number') || h.includes('invoice'));
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('created') || h.includes('time'));

  if (codeIdx === -1 || amountIdx === -1) {
    throw new Error("CSV FORMAT ERROR: Could not auto-detect 'Discount Code' or 'Total Amount' columns.");
  }

  const results: ImportedSale[] = [];

  // Process rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle basic CSV escaping (commas inside quotes)
    const row: string[] = [];
    let current = '';
    let inQuote = false;
    for (let char of line) {
      if (char === '"') { inQuote = !inQuote; }
      else if (char === ',' && !inQuote) { row.push(current); current = ''; }
      else { current += char; }
    }
    row.push(current);

    // Extract Data
    const rawCode = row[codeIdx]?.replace(/["']/g, '').trim();
    const rawAmount = row[amountIdx]?.replace(/["'$]/g, '').trim();
    const rawOrder = orderIdx !== -1 ? row[orderIdx]?.replace(/["']/g, '').trim() : `CSV_ROW_${i}`;
    const rawDate = dateIdx !== -1 ? row[dateIdx]?.replace(/["']/g, '').trim() : undefined;

    if (rawCode && rawAmount) {
      const amount = parseFloat(rawAmount);
      if (!isNaN(amount) && amount > 0) {
        results.push({
          code: rawCode.toUpperCase(),
          amount,
          orderId: rawOrder,
          date: rawDate
        });
      }
    }
  }

  return results;
};