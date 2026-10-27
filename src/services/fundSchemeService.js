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
 * Resolves standard scheme code string from an account object, profile object, draft object, or raw string/code.
 */
export const resolveSchemeCode = (target) => {
  if (!target) return 'VIVAH_SAHAYOG';

  let raw = '';
  if (typeof target === 'object') {
    raw =
      target.sahayogType ||
      target.schemeCode ||
      (typeof target.scheme === 'string' ? target.scheme : target.scheme?.code || target.scheme?.name) ||
      target.sahayogName ||
      target.schemeName ||
      target.name ||
      target.code ||
      target.accountNumber ||
      target.sahayogId ||
      target.vivahSahayogId ||
      target.fundAccountId ||
      '';
  } else {
    raw = String(target || '');
  }

  const s = String(raw).trim().toUpperCase();

  if (s.includes('MAHILA') || s.includes('महिला') || s.startsWith('MSH') || s.startsWith('MSA')) {
    return 'MAHILA_SAHAYOG';
  }
  if (s.includes('KISAN') || s.includes('किसान') || s.startsWith('KSH') || s.startsWith('KSA')) {
    return 'KISAN_SAHAYOG';
  }
  if ((s.includes('BAL') && !s.includes('VIVAH')) || s.includes('बाल') || s.startsWith('BSH') || s.startsWith('BSA')) {
    return 'BAL_SAHAYOG';
  }
  if (s.includes('VARISHTHA') || s.includes('वरिष्ठ') || s.includes('SENIOR') || s.startsWith('VNS') || s.startsWith('VNA')) {
    return 'VARISHTHA_NAGARIK_SAHAYOG';
  }
  if (s.includes('VIVAH') || s.includes('विवाह') || s.startsWith('VSH') || s.startsWith('VSA')) {
    return 'VIVAH_SAHAYOG';
  }

  // If already a valid code format
  if (s && s !== 'VIVAH_SAHAYOG') {
    return s;
  }

  return 'VIVAH_SAHAYOG';
};

/**
 * Returns UI metadata (name, color, icons, labels) for any scheme code or account object.
 */
export const getSchemeMeta = (codeOrTarget) => {
  const code = resolveSchemeCode(codeOrTarget);
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
      withdrawalRuleHindi: 'फंड राशि निकासी नियम: खाते में लॉक-इन राशि (Lock-in Amount) बनाए रखते हुए शेष राशि निकाली जा सकेगी।',
      withdrawalRuleEnglish: 'Fund withdrawal rule: Any amount above the required lock-in amount can be withdrawn.',
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
      withdrawalRuleHindi: 'फंड राशि निकासी नियम: खाते में लॉक-इन राशि (Lock-in Amount) बनाए रखते हुए शेष राशि निकाली जा सकेगी।',
      withdrawalRuleEnglish: 'Fund withdrawal rule: Any amount above the required lock-in amount can be withdrawn.',
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
      withdrawalRuleHindi: 'फंड राशि निकासी नियम: खाते में लॉक-इन राशि (Lock-in Amount) बनाए रखते हुए शेष राशि निकाली जा सकेगी।',
      withdrawalRuleEnglish: 'Fund withdrawal rule: Any amount above the required lock-in amount can be withdrawn.',
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
      withdrawalRuleHindi: 'फंड राशि निकासी नियम: खाते में लॉक-इन राशि (Lock-in Amount) बनाए रखते हुए शेष राशि निकाली जा सकेगी।',
      withdrawalRuleEnglish: 'Fund withdrawal rule: Any amount above the required lock-in amount can be withdrawn.',
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
    withdrawalRuleHindi: 'फंड राशि निकासी नियम: आवेदक/बालिका की आयु 20 वर्ष से अधिक होने पर ही खाते में लॉक-इन राशि (Lock-in Amount) बनाए रखते हुए फंड खाते से राशि निकाली जा सकेगी।',
    withdrawalRuleEnglish: 'Fund withdrawal rule: Fund amount above the lock-in amount can only be withdrawn once the applicant/girl child reaches over 20 years of age.',
  };
};
