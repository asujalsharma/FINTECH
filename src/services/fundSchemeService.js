import { getData } from '../API';

/**
 * Normalizes scheme code to ensure consistent lookup.
 */
export const normalizeSchemeCode = code => {
  if (!code || typeof code !== 'string') return '';
  return code.trim();
};

/**
 * Fetch all Sahayog schemes from backend API.
 * Endpoint: GET /api/fund-account/schemes
 * Aliases: GET /api/fund-account/types, GET /api/fund-account/categories
 */
export const fetchAllFundSchemes = async () => {
  const endpoints = [
    '/api/fund-account/schemes',
    '/api/fund-account/types',
    '/api/fund-account/categories',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await getData(endpoint);
      if (res && (res.Status !== false || res.Data || res.schemes)) {
        const rawList =
          res?.Data?.schemes ||
          (Array.isArray(res?.Data) ? res.Data : null) ||
          res?.schemes ||
          (Array.isArray(res?.data) ? res.data : null);

        if (Array.isArray(rawList) && rawList.length > 0) {
          // Sort by sortOrder ascending
          return rawList.slice().sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
        }
      }
    } catch (err) {
      console.log(`Failed fetching schemes from ${endpoint}:`, err?.message || err);
    }
  }

  return [];
};

/**
 * Fetch single scheme details by code or slug.
 * Endpoint: GET /api/fund-account/schemes/:code
 * Aliases: GET /api/fund-account/scheme/:code
 *
 * @param {string} code - e.g. VIVAH_SAHAYOG, vivah, MAHILA_SAHAYOG, etc.
 */
export const fetchSingleFundScheme = async code => {
  if (!code) return null;
  const cleanCode = normalizeSchemeCode(code);
  const endpoints = [
    `/api/fund-account/schemes/${encodeURIComponent(cleanCode)}`,
    `/api/fund-account/scheme/${encodeURIComponent(cleanCode)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await getData(endpoint);
      if (res && res.Status !== false) {
        const scheme =
          res?.Data?.scheme ||
          (res?.Data && !Array.isArray(res.Data) && (res.Data.code || res.Data.name) ? res.Data : null) ||
          res?.scheme ||
          (res?.data && !Array.isArray(res.data) && (res.data.code || res.data.name) ? res.data : null) ||
          (res?.code || res?.name ? res : null);

        if (scheme) return scheme;
      }
    } catch (err) {
      console.log(`Failed fetching scheme details from ${endpoint}:`, err?.message || err);
    }
  }


  return null;
};

/**
 * Returns UI metadata (name, color, icons, labels) for any scheme code.
 */
export const getSchemeMeta = (code) => {
  const c = String(code || '').toUpperCase();
  if (c.includes('MAHILA')) {
    return {
      code: 'MAHILA_SAHAYOG',
      name: 'महिला सहयोग',
      color: '#7C3AED',
      icon: 'human-female',
      faIcon: 'female',
      symbol: '👩',
      label: 'महिला',
      beneficiaryLabel: 'महिला लाभार्थी',
      idPrefix: 'MSH',
    };
  }
  if (c.includes('KISAN')) {
    return {
      code: 'KISAN_SAHAYOG',
      name: 'किसान सहयोग',
      color: '#16A34A',
      icon: 'sprout',
      faIcon: 'seedling',
      symbol: '🌾',
      label: 'किसान',
      beneficiaryLabel: 'किसान लाभार्थी',
      idPrefix: 'KSH',
    };
  }
  if (c.includes('BAL') && !c.includes('VIVAH')) {
    return {
      code: 'BAL_SAHAYOG',
      name: 'बाल सहयोग',
      color: '#0284C7',
      icon: 'baby-face-outline',
      faIcon: 'child',
      symbol: '👶',
      label: 'बालक/बालिका',
      beneficiaryLabel: 'बालक/बालिका',
      idPrefix: 'BSH',
    };
  }
  if (c.includes('VARISHTHA') || c.includes('SENIOR')) {
    return {
      code: 'VARISHTHA_NAGARIK_SAHAYOG',
      name: 'वरिष्ठ नागरिक सहयोग',
      color: '#EA580C',
      icon: 'account-supervisor-circle',
      faIcon: 'user-friends',
      symbol: '👴',
      label: 'वरिष्ठ नागरिक',
      beneficiaryLabel: 'वरिष्ठ नागरिक',
      idPrefix: 'VNS',
    };
  }
  return {
    code: 'VIVAH_SAHAYOG',
    name: 'विवाह सहयोग',
    color: '#D81B60',
    icon: 'heart-outline',
    faIcon: 'heart',
    symbol: '💍',
    label: 'बालिका',
    beneficiaryLabel: 'बालिका (बेटी)',
    idPrefix: 'VSH',
  };
};
