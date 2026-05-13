/**
 * Проверка корзины на превышение остатков и недоступные позиции.
 * @param {Array<object>} items
 * @returns {Array<{ name: string, detail: string }>}
 */
export function getCartStockIssues(items) {
  if (!Array.isArray(items)) return [];
  const issues = [];

  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;

    const name = item.product_name || item.name || item.title || 'Товар';

    if (item.is_available === false || item.is_available === 0 || item.is_available === '0') {
      issues.push({
        name,
        detail: `${name}: позиция недоступна для заказа`,
      });
      continue;
    }

    const isActive =
      item.is_active !== false &&
      item.is_active !== 0 &&
      item.is_active !== '0';
    if (!isActive) {
      issues.push({
        name,
        detail: `${name}: товар снят с продажи`,
      });
      continue;
    }

    const stock = item.stock != null ? Number(item.stock) : NaN;
    if (!Number.isFinite(stock) || stock < 0) {
      continue;
    }

    if (qty > stock) {
      issues.push({
        name,
        detail: `${name}: в корзине ${qty} шт., в наличии ${stock}`,
      });
    }
  }

  return issues;
}

export function formatCartStockIssuesMessage(issues) {
  if (!issues || !issues.length) return '';
  return issues.map((i) => i.detail).join(' ');
}
