// Shared normalization + facet aggregation for product filters.
// Goal: the values shown in FiltersCard MUST match values used for filtering.

export function toYesNo(v) {
  if (typeof v === 'boolean') return v ? 'Да' : 'Нет';
  if (v === 'true' || v === 'True') return 'Да';
  if (v === 'false' || v === 'False') return 'Нет';
  return v;
}

function toCleanString(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function toBooleanLoose(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v ?? '').trim().toLowerCase();
  if (s === '') return null;
  if (['true', 'да', 'yes', 'y', '1', 'on'].includes(s)) return true;
  if (['false', 'нет', 'no', 'n', '0', 'off'].includes(s)) return false;
  return null;
}

export function getResolutionClass(res) {
  if (!res) return null;
  const m = String(res).match(/(\d+)x(\d+)/);
  if (!m) return null;
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  const maxSide = Math.max(w, h);
  if (maxSide >= 3000) return 'Quad HD+';
  if (maxSide >= 2300) return 'Full HD+';
  return 'HD+';
}

export function getScreenSizeRange(sizeStr) {
  if (!sizeStr) return null;
  const num = parseFloat(String(sizeStr).replace(/[^0-9.]/g, ''));
  if (!num) return null;
  if (num < 6.0) return 'до 6.0"';
  if (num <= 6.5) return '6.1-6.5"';
  if (num <= 6.9) return '6.6-6.9"';
  return '7.0+"';
}

export function getBatteryCapacityBucket(capStr) {
  if (!capStr) return null;
  const num = parseInt(String(capStr).replace(/[^0-9]/g, ''), 10);
  if (!num) return null;
  if (num < 2000) return '<2000 мАч';
  if (num < 3000) return '2000–3000 мАч';
  if (num < 4000) return '3000–4000 мАч';
  if (num < 5000) return '4000–5000 мАч';
  if (num < 6000) return '5000–6000 мАч';
  return '6000+ мАч';
}

export function getFastChargeRange(wattStr) {
  if (!wattStr) return null;
  const num = parseInt(String(wattStr).replace(/[^0-9]/g, ''), 10);
  if (!num) return 'Нет';
  if (num < 30) return '15-30 Вт';
  if (num <= 65) return '30-65 Вт';
  return '65+ Вт';
}

export function getCameraCountBucket(cameraStr) {
  if (!cameraStr) return null;
  const plusCount = (String(cameraStr).match(/\+/g) || []).length + 1;
  if (plusCount <= 2) return '2';
  if (plusCount === 3) return '3';
  if (plusCount === 4) return '4';
  return '5+';
}

export function getProcessorCompany(proc) {
  const s = String(proc || '').toLowerCase();
  if (s.includes('qualcomm') || s.includes('snapdragon')) return 'Qualcomm';
  if (s.includes('mediatek')) return 'MediaTek';
  if (s.includes('exynos')) return 'Samsung';
  if (s.includes('apple') || s.includes('a18') || s.includes('a17') || s.includes('a-series')) return 'Apple';
  if (s.includes('google') || s.includes('tensor')) return 'Google';
  return null;
}

export function getCpuCores(processor, chip) {
  const texts = [String(processor || ''), String(chip || '')];
  for (const t of texts) {
    // English patterns: 12-core, 8 core CPU
    const mEn = t.match(/(\d+)\s*-?\s*core/i);
    if (mEn && mEn[1]) return `${parseInt(mEn[1], 10)} ядер`;
    // Russian patterns: 6-ядерн, 8 ядерный, 8-ядерный CPU
    const mRu = t.match(/(\d+)\s*-?\s*ядер/i);
    if (mRu && mRu[1]) return `${parseInt(mRu[1], 10)} ядер`;
    const mRu2 = t.match(/(\d+)\s*-?\s*ядерн/i);
    if (mRu2 && mRu2[1]) return `${parseInt(mRu2[1], 10)} ядер`;
    // Sometimes like "6-ядерным CPU"
    const mCpu = t.match(/(\d+)\s*-?\s*ядерн.*CPU/i);
    if (mCpu && mCpu[1]) return `${parseInt(mCpu[1], 10)} ядер`;
  }
  return null;
}

function addFacetValue(facets, key, value) {
  const v = toCleanString(value);
  if (!v) return;
  if (!facets[key]) facets[key] = new Set();
  facets[key].add(v);
}

/**
 * Build all filterable facet values for a product, including:
 * - raw specs values (normalized via toYesNo)
 * - derived keys used by the UI (supports_5g, wireless_charge_support, buckets, etc.)
 *
 * Returns object: key -> string[] (deduped)
 */
export function buildProductFacetValues(parsedSpecs = {}) {
  const facets = {};

  // Raw specs -> normalized strings
  Object.entries(parsedSpecs || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => addFacetValue(facets, key, toYesNo(item)));
    } else {
      addFacetValue(facets, key, toYesNo(value));
    }
  });

  // Derived: supports_5g from network text
  const network = parsedSpecs?.network || '';
  const supports5g = /(^|\b)5G(\b|,)/i.test(String(network));
  addFacetValue(facets, 'supports_5g', supports5g ? 'Да' : 'Нет');

  // Derived: wireless charge support
  const wireless = parsedSpecs?.wireless_charge;
  const wirelessBool = toBooleanLoose(wireless);
  // Keep behavior compatible with existing logic for non-boolean values
  const hasWireless =
    wirelessBool !== null
      ? wirelessBool
      : Boolean(wireless && String(wireless).trim().toLowerCase() !== 'false');
  addFacetValue(facets, 'wireless_charge_support', hasWireless ? 'Да' : 'Нет');

  // Buckets/ranges
  addFacetValue(facets, 'screen_size_range', getScreenSizeRange(parsedSpecs?.screen_size));
  addFacetValue(facets, 'battery_capacity_bucket', getBatteryCapacityBucket(parsedSpecs?.battery));
  addFacetValue(facets, 'fast_charge_range', getFastChargeRange(parsedSpecs?.fast_charge));

  // Cameras
  addFacetValue(facets, 'camera_count_bucket', getCameraCountBucket(parsedSpecs?.camera));

  // Video: can include both 8K and 4K
  const video = String(parsedSpecs?.video || '');
  if (/8k/i.test(video)) addFacetValue(facets, 'video_recording', '8K');
  if (/4k/i.test(video)) addFacetValue(facets, 'video_recording', '4K');

  // Resolution class
  addFacetValue(facets, 'resolution_class', getResolutionClass(parsedSpecs?.resolution));

  // Processor company and cores
  addFacetValue(facets, 'processor_company', getProcessorCompany(parsedSpecs?.processor));
  addFacetValue(facets, 'cpu_cores', getCpuCores(parsedSpecs?.processor, parsedSpecs?.chip));

  // Normalize material: glass/metal/plastic
  const materialRaw = String(parsedSpecs?.material || '').toLowerCase();
  let materialBasic = null;
  if (/стекл|glass/.test(materialRaw)) materialBasic = 'Стекло';
  if (/алюм|металл|metal|steel/.test(materialRaw)) materialBasic = 'Металл';
  if (/пласт|plastic/.test(materialRaw)) materialBasic = 'Пластик';
  addFacetValue(facets, 'material_basic', materialBasic);

  // Convert Sets -> arrays (sorted) for stable behavior
  const out = {};
  Object.entries(facets).forEach(([k, set]) => {
    out[k] = Array.from(set).filter(Boolean).sort();
  });
  return out;
}

/**
 * Aggregates available filter values + per-value counts.
 *
 * @param {Array<{parsedSpecs: object}>} processedProducts
 * @returns {{ specifications: Record<string,string[]>, specificationsCountMap: Map<string,number> }}
 */
export function aggregateSpecifications(processedProducts = []) {
  const keyToValues = {};
  const countMap = new Map();

  const addValue = (key, value) => {
    const v = toCleanString(value);
    if (!v) return;
    if (!keyToValues[key]) keyToValues[key] = new Set();
    keyToValues[key].add(v);
  };

  const addCount = (key, value) => {
    const v = toCleanString(value);
    if (!v) return;
    const mapKey = `${key}-${v}`;
    countMap.set(mapKey, (countMap.get(mapKey) || 0) + 1);
  };

  processedProducts.forEach((product) => {
    const facetValues = buildProductFacetValues(product?.parsedSpecs || {});
    Object.entries(facetValues).forEach(([key, values]) => {
      (Array.isArray(values) ? values : [values]).forEach((v) => {
        addValue(key, v);
        addCount(key, v);
      });
    });
  });

  const specifications = {};
  Object.entries(keyToValues).forEach(([key, set]) => {
    specifications[key] = Array.from(set).filter(Boolean).sort();
  });

  return { specifications, specificationsCountMap: countMap };
}

/**
 * Checks if product matches selected facet filters.
 * `filters` shape: { [key: string]: string[] } where values are EXACTLY what UI shows.
 */
export function productMatchesFacetFilters(product, filters = {}) {
  const facetValues = buildProductFacetValues(product?.parsedSpecs || {});

  for (const [key, selectedValues] of Object.entries(filters)) {
    if (!Array.isArray(selectedValues) || selectedValues.length === 0) continue;

    const productValues = facetValues[key];
    if (!productValues || productValues.length === 0) return false;

    // OR within a key (checkboxes), AND across keys
    const hasAny = selectedValues.some((sv) => productValues.includes(String(sv)));
    if (!hasAny) return false;
  }

  return true;
}

