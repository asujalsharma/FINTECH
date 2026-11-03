import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const LANGUAGE_STORAGE_KEY = '@app_language';
export const TRANSLATION_CACHE_KEY = '@app_translation_cache';

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    subText: 'Default Language',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    subText: 'नमस्ते! हिंदी में उपयोग करें',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    subText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਪੰਜਾਬੀ ਵਿੱਚ ਵਰਤੋ',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    subText: 'নমস্কার! বাংলায় ব্যবহার করুন',
  },
];

// Comprehensive multi-lingual dictionary covering every screen element
export const DICTIONARY = {
  // Brand & Slogans
  'online adda': {
    en: 'Online Adda',
    hi: 'ऑनलाइन अड्डा',
    pa: 'ਆਨਲਾਈਨ ਅੱਡਾ',
    bn: 'অনলাইন আড্ডা',
  },
  'har ghar digital': {
    en: 'HAR GHAR DIGITAL',
    hi: 'हर घर डिजिटल',
    pa: 'ਹਰ ਘਰ ਡਿਜੀਟਲ',
    bn: 'প্রতি ঘরে ডিজিটাল',
  },

  // Navigation & Headers
  home: {
    en: 'Home',
    hi: 'होम',
    pa: 'ਘਰ',
    bn: 'হোম',
  },
  reports: {
    en: 'Reports',
    hi: 'रिपोर्ट्स',
    pa: 'ਰਿਪੋਰਟਾਂ',
    bn: 'রিপোর্ট',
  },
  stats: {
    en: 'Stats',
    hi: 'आंकड़े',
    pa: 'ਅੰਕੜੇ',
    bn: 'পরিসংখ্যান',
  },
  support: {
    en: 'Support',
    hi: 'सहायता',
    pa: 'ਸਹਾਇਤਾ',
    bn: 'সহায়তা',
  },
  profile: {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    pa: 'ਪ੍ਰੋਫਾਈਲ',
    bn: 'প্রোফাইল',
  },
  my_account: {
    en: 'My Account',
    hi: 'मेरा खाता',
    pa: 'ਮੇਰਾ ਖਾਤਾ',
    bn: 'আমার অ্যাকাউন্ট',
  },
  search: {
    en: 'Search',
    hi: 'खोजें',
    pa: 'ਖੋਜੋ',
    bn: 'অনুসন্ধান',
  },
  search_results: {
    en: 'Search Results',
    hi: 'खोज परिणाम',
    pa: 'ਖੋਜ ਨਤੀਜੇ',
    bn: 'অনুসন্ধান ফলাফল',
  },
  all_services: {
    en: 'All Services',
    hi: 'सभी सेवाएं',
    pa: 'ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ',
    bn: 'সমস্ত পরিষেবা',
  },
  search_placeholder: {
    en: 'Search mobile, DTH, electricity, fastag...',
    hi: 'मोबाइल, डीटीएच, बिजली, फास्टैग खोजें...',
    pa: 'ਮੋਬਾਈਲ, ਡੀਟੀਐੱਚ, ਬਿਜਲੀ, ਫਾਸਟੈਗ ਖੋਜੋ...',
    bn: 'মোবাইল, ডিটিএইচ, বিদ্যুৎ, ফাস্ট্যাগ খুঁজুন...',
  },

  // Wallet & Cashback
  wallet: {
    en: 'Wallet',
    hi: 'वॉलेट',
    pa: 'ਵਾਲਿਟ',
    bn: 'ওয়ালেট',
  },
  wallet_balance: {
    en: 'Wallet Balance',
    hi: 'वॉलेट बैलेंस',
    pa: 'ਵਾਲਿਟ ਬਕਾਇਆ',
    bn: 'ওয়ালেট ব্যালেন্স',
  },
  available_balance: {
    en: 'Available Balance',
    hi: 'उपलब्ध शेष राशि',
    pa: 'ਉਪਲਬਧ ਬਕਾਇਆ',
    bn: 'উপলব্ধ ব্যালেন্স',
  },
  your_cashback: {
    en: 'Your Cashback',
    hi: 'आपका कैशबैक',
    pa: 'ਤੁਹਾਡਾ ਕੈਸ਼ਬੈਕ',
    bn: 'আপনার ক্যাশব্যাক',
  },
  view_balance: {
    en: 'View Balance',
    hi: 'बैलेंस देखें',
    pa: 'ਬਕਾਇਆ ਦੇਖੋ',
    bn: 'ব্যালেন্স দেখুন',
  },
  hide_balance: {
    en: 'Hide Balance',
    hi: 'बैलेंस छुपाएं',
    pa: 'ਬਕਾਇਆ ਲੁਕਾਓ',
    bn: 'ব্যালেন্স লুকান',
  },
  view_cashback: {
    en: 'View Cashback',
    hi: 'कैशबैक देखें',
    pa: 'ਕੈਸ਼ਬੈਕ ਦੇਖੋ',
    bn: 'ক্যাশব্যাক দেখুন',
  },
  hide_cashback: {
    en: 'Hide Cashback',
    hi: 'कैशबैक छुपाएं',
    pa: 'ਕੈਸ਼ਬੈਕ ਲੁਕਾਓ',
    bn: 'ক্যাশব্যাক লুকান',
  },
  add_money: {
    en: 'Add Money',
    hi: 'पैसे जोड़ें',
    pa: 'ਪੈਸੇ ਜੋੜੋ',
    bn: 'টাকা যোগ করুন',
  },
  refresh: {
    en: 'Refresh',
    hi: 'रिफ्रेश',
    pa: 'ਤਾਜ਼ਾ ਕਰੋ',
    bn: 'রিফ্রেশ',
  },
  updating: {
    en: 'Updating...',
    hi: 'अपडेट हो रहा है...',
    pa: 'ਅੱਪਡੇਟ ਹੋ ਰਿਹਾ ਹੈ...',
    bn: 'আপডেট হচ্ছে...',
  },

  // Recharge & Bill Payments
  recharge_and_bills: {
    en: 'Recharge / Bill Payments',
    hi: 'रिचार्ज / बिल भुगतान',
    pa: 'ਰੀਚਾਰਜ / ਬਿੱਲ ਭੁਗਤਾਨ',
    bn: 'রিচার্জ / বিল পেমেন্ট',
  },
  recharge: {
    en: 'Recharge',
    hi: 'रिचार्ज',
    pa: 'ਰੀਚਾਰਜ',
    bn: 'রিচার্জ',
  },
  mobile: {
    en: 'Mobile',
    hi: 'मोबाइल',
    pa: 'ਮੋਬਾਈਲ',
    bn: 'মোবাইল',
  },
  mobile_recharge: {
    en: 'Mobile Recharge',
    hi: 'मोबाइल रिचार्ज',
    pa: 'ਮੋਬਾਈਲ ਰੀਚਾਰਜ',
    bn: 'মোবাইল রিচার্জ',
  },
  'mobile\nrecharge': {
    en: 'Mobile\nRecharge',
    hi: 'मोबाइल\nरिचार्ज',
    pa: 'ਮੋਬਾਈਲ\nਰੀਚਾਰਜ',
    bn: 'মোবাইল\nরিচার্জ',
  },
  dth: {
    en: 'DTH',
    hi: 'डीटीएच',
    pa: 'ਡੀਟੀਐੱਚ',
    bn: 'ডিটিএইচ',
  },
  dth_recharge: {
    en: 'DTH Recharge',
    hi: 'डीटीएच रिचार्ज',
    pa: 'ਡੀਟੀਐੱਚ ਰੀਚਾਰਜ',
    bn: 'ডিটিএইচ রিচার্জ',
  },
  'dth\nrecharge': {
    en: 'DTH\nRecharge',
    hi: 'डीटीएच\nरिचार्ज',
    pa: 'ਡੀਟੀਐੱਚ\nਰੀਚਾਰਜ',
    bn: 'ডিটিএইচ\nরিচার্জ',
  },
  electricity: {
    en: 'Electricity',
    hi: 'बिजली',
    pa: 'ਬਿਜਲੀ',
    bn: 'বিদ্যুৎ',
  },
  electricity_bill: {
    en: 'Electricity Bill',
    hi: 'बिजली बिल',
    pa: 'ਬਿਜਲੀ ਦਾ ਬਿੱਲ',
    bn: 'বিদ্যুৎ বিল',
  },
  'electricity\nbill': {
    en: 'Electricity\nBill',
    hi: 'बिजली\nबिल',
    pa: 'ਬਿਜਲੀ ਦਾ\nਬਿੱਲ',
    bn: 'বিদ্যুৎ\nবিল',
  },
  fastag: {
    en: 'FASTag',
    hi: 'फास्टैग',
    pa: 'ਫਾਸਟੈਗ',
    bn: 'ফাস্ট্যাগ',
  },
  fastag_recharge: {
    en: 'FASTag Recharge',
    hi: 'फास्टैग रिचार्ज',
    pa: 'ਫਾਸਟੈਗ ਰੀਚਾਰਜ',
    bn: 'ফাস্ট্যাগ রিচার্জ',
  },
  'fastag\nrecharge': {
    en: 'FasTag\nRecharge',
    hi: 'फास्टैग\nरिचार्ज',
    pa: 'ਫਾਸਟੈਗ\nਰੀਚਾਰਜ',
    bn: 'ফাস্ট্যাগ\nরিচার্জ',
  },
  gas_cylinder: {
    en: 'Gas Cylinder',
    hi: 'गैस सिलेंडर',
    pa: 'ਗੈਸ ਸਿਲੰਡਰ',
    bn: 'গ্যাস সিলিন্ডার',
  },
  broadband: {
    en: 'Broadband',
    hi: 'ब्रॉडबैंड',
    pa: 'ਬਰਾਡਬੈਂਡ',
    bn: 'ব্রডব্যান্ড',
  },
  google_play: {
    en: 'Google Play',
    hi: 'गूगल प्ले',
    pa: 'ਗੂਗਲ ਪਲੇ',
    bn: 'গুগল প্লে',
  },
  water: {
    en: 'Water',
    hi: 'पानी बिल',
    pa: 'ਪਾਣੀ ਦਾ ਬਿੱਲ',
    bn: 'জল বিল',
  },
  postpaid: {
    en: 'Postpaid',
    hi: 'पोस्टपेड',
    pa: 'ਪੋਸਟਪੇਡ',
    bn: 'পোস্টপেইড',
  },
  prepaid: {
    en: 'Prepaid',
    hi: 'प्रीपेड',
    pa: 'ਪ੍ਰੀਪੇਡ',
    bn: 'প্রিপেইড',
  },
  landline: {
    en: 'Landline',
    hi: 'लैंडलाइन',
    pa: 'ਲੈਂਡਲਾਈਨ',
    bn: 'ল্যান্ডলাইন',
  },
  insurance: {
    en: 'Insurance',
    hi: 'बीमा',
    pa: 'ਬੀਮਾ',
    bn: 'বীমা',
  },
  loan_repayment: {
    en: 'Loan Repayment',
    hi: 'ऋण भुगतान',
    pa: 'ਕਰਜ਼ਾ ਭੁਗਤਾਨ',
    bn: 'ঋণ পরিশোধ',
  },
  credit_card: {
    en: 'Credit Card',
    hi: 'क्रेडिट कार्ड',
    pa: 'ਕ੍ਰੈਡਿਟ ਕਾਰਡ',
    bn: 'ক্রেডিট কার্ড',
  },
  cable_tv: {
    en: 'Cable TV',
    hi: 'केबल टीवी',
    pa: 'ਕੇਬਲ ਟੀਵੀ',
    bn: 'কেবল টিভি',
  },
  municipal_taxes: {
    en: 'Municipal Taxes',
    hi: 'नगर निगम कर',
    pa: 'ਮਿਊਂਸੀਪਲ ਟੈਕਸ',
    bn: 'পৌরসভা কর',
  },
  hospital: {
    en: 'Hospital',
    hi: 'अस्पताल',
    pa: 'ਹਸਪਤਾਲ',
    bn: 'হাসপাতাল',
  },
  housing_society: {
    en: 'Housing Society',
    hi: 'हाउसिंग सोसाइटी',
    pa: 'ਹਾਊਸਿੰਗ ਸੁਸਾਇਟੀ',
    bn: 'হাউজিং সোসাইটি',
  },

  // Banners & Promos
  '⚡ special offer': {
    en: '⚡ SPECIAL OFFER',
    hi: '⚡ विशेष ऑफर',
    pa: '⚡ ਖਾਸ ਪੇਸ਼ਕਸ਼',
    bn: '⚡ বিশেষ অফার',
  },
  'up to ₹50 cashback': {
    en: 'Up to ₹50 Cashback',
    hi: '₹50 तक कैशबैक',
    pa: '₹50 ਤੱਕ ਕੈਸ਼ਬੈਕ',
    bn: '₹৫০ পর্যন্ত ক্যাশব্যাক',
  },
  'on your first mobile or dth recharge this month': {
    en: 'On your first Mobile or DTH recharge this month',
    hi: 'इस महीने अपने पहले मोबाइल या डीटीएच रिचार्ज पर',
    pa: 'ਇਸ ਮਹੀਨੇ ਆਪਣੇ ਪਹਿਲੇ ਮੋਬਾਈਲ ਜਾਂ ਡੀਟੀਐਚ ਰੀਚਾਰਜ ' + "'ਤੇ",
    bn: 'এই মাসে আপনার প্রথম মোবাইল বা ডিটিএইচ রিচার্জে',
  },
  'recharge now →': {
    en: 'Recharge Now →',
    hi: 'अभी रिचार्ज करें →',
    pa: 'ਹੁਣੇ ਰੀਚਾਰਜ ਕਰੋ →',
    bn: 'এখনই রিচার্জ করুন →',
  },
  '💡 utility bills': {
    en: '💡 UTILITY BILLS',
    hi: '💡 उपयोगिता बिल',
    pa: '💡 ਉਪਯੋਗਤਾ ਬਿੱਲ',
    bn: '💡 ইউটিলিটি বিল',
  },
  'pay electricity & water bills': {
    en: 'Pay Electricity & Water Bills',
    hi: 'बिजली और पानी का बिल भरें',
    pa: 'ਬਿਜਲੀ ਅਤੇ ਪਾਣੀ ਦੇ ਬਿੱਲ ਭਰੋ',
    bn: 'বিদ্যুৎ ও জল বিল পরিশোধ করুন',
  },
  'zero extra fees & instant payment receipt via bbps': {
    en: 'Zero extra fees & instant payment receipt via BBPS',
    hi: 'शून्य अतिरिक्त शुल्क और बीबीपीएस द्वारा तत्काल रसीद',
    pa: 'ਜ਼ੀਰੋ ਵਾਧੂ ਫੀਸ ਅਤੇ ਬੀਬੀਪੀਐਸ ਰਾਹੀਂ ਤੁਰੰਤ ਰਸੀਦ',
    bn: 'শূন্য অতিরিক্ত ফি এবং বিবিপিএস মাধ্যমে তাত্ক্ষণিক রসিদ',
  },
  'pay bills →': {
    en: 'Pay Bills →',
    hi: 'बिल भरें →',
    pa: 'ਬਿੱਲ ਭਰੋ →',
    bn: 'বিল পরিশোধ করুন →',
  },
  '🎁 refer & earn': {
    en: '🎁 REFER & EARN',
    hi: '🎁 रेफर करें और कमाएं',
    pa: '🎁 ਰੈਫਰ ਕਰੋ ਅਤੇ ਕਮਾਓ',
    bn: '🎁 রেফার করুন এবং উপার্জন করুন',
  },
  'invite friends & win rewards': {
    en: 'Invite Friends & Win Rewards',
    hi: 'दोस्तों को आमंत्रित करें और इनाम जीतें',
    pa: 'ਦੋਸਤਾਂ ਨੂੰ ਸੱਦਾ ਦਿਓ ਅਤੇ ਇਨਾਮ ਜਿੱਤੋ',
    bn: 'বন্ধুদের আমন্ত্রণ জানান এবং পুরস্কার জিতুন',
  },
  'earn instant bonus directly in your wallet on every join': {
    en: 'Earn instant bonus directly in your wallet on every join',
    hi: 'हर जॉइन पर सीधे अपने वॉलेट में तुरंत बोनस पाएं',
    pa: 'ਹਰ ਸ਼ਾਮਲ ਹੋਣ ' + "'ਤੇ ਸਿੱਧਾ ਆਪਣੇ ਵਾਲਿਟ ਵਿੱਚ ਤੁਰੰਤ ਬੋਨਸ ਪ੍ਰਾਪਤ ਕਰੋ",
    bn: 'প্রতি যোগদানে সরাসরি আপনার ওয়ালেটে তাত্ক্ষণিক বোনাস পান',
  },
  'invite friends →': {
    en: 'Invite Friends →',
    hi: 'दोस्तों को आमंत्रित करें →',
    pa: 'ਦੋਸਤਾਂ ਨੂੰ ਸੱਦਾ ਦਿਓ →',
    bn: 'বন্ধুদের আমন্ত্রণ জানান →',
  },
  '🛡️ 100% secure': {
    en: '🛡️ 100% SECURE',
    hi: '🛡️ 100% सुरक्षित',
    pa: '🛡️ 100% ਸੁਰੱਖਿਅਤ',
    bn: '🛡️ 100% নিরাপদ',
  },
  'instant wallet top-up': {
    en: 'Instant Wallet Top-up',
    hi: 'तुरंत वॉलेट टॉप-अप',
    pa: 'ਤੁਰੰਤ ਵਾਲਿਟ ਟੌਪ-ਅੱਪ',
    bn: 'তাত্ক্ষণিক ওয়ালেট টপ-আপ',
  },
  'zero delay upi transfer with 24/7 payment support': {
    en: 'Zero delay UPI transfer with 24/7 payment support',
    hi: '24/7 भुगतान सहायता के साथ तत्काल यूपीआई ट्रांसफर',
    pa: '24/7 ਭੁਗਤਾਨ ਸਹਾਇਤਾ ਨਾਲ ਤੁਰੰਤ ਯੂਪੀਆਈ ਟ੍ਰਾਂਸਫਰ',
    bn: '24/7 পেমেন্ট সাপোর্ট সহ তাত্ক্ষণিক ইউপিআই ট্রান্সফার',
  },
  'add balance →': {
    en: 'Add Balance →',
    hi: 'बैलेंस जोड़ें →',
    pa: 'ਬਕਾਇਆ ਜੋੜੋ →',
    bn: 'ব্যালেন্স যোগ করুন →',
  },

  // Refer & Earn Banner
  '🎁 invite & earn': {
    en: '🎁 INVITE & EARN',
    hi: '🎁 आमंत्रित करें और कमाएं',
    pa: '🎁 ਸੱਦਾ ਦਿਓ ਅਤੇ ਕਮਾਓ',
    bn: '🎁 আমন্ত্রণ জানান এবং উপার্জন করুন',
  },
  'share the experience with friends': {
    en: 'Share the experience with friends',
    hi: 'दोस्तों के साथ अनुभव साझा करें',
    pa: 'ਦੋਸਤਾਂ ਨਾਲ ਅਨੁਭਵ ਸਾਂਝਾ ਕਰੋ',
    bn: 'বন্ধুদের সাথে অভিজ্ঞতা শেয়ার করুন',
  },
  'earn up to ₹100 guaranteed cashback on every successful referral!': {
    en: 'Earn up to ₹100 guaranteed cashback on every successful referral!',
    hi: 'प्रत्येक सफल रेफरल पर ₹100 तक का गारंटीकृत कैशबैक पाएं!',
    pa: 'ਹਰੇਕ ਸਫਲ ਰੈਫਰਲ ' + "'ਤੇ ₹100 ਤੱਕ ਦਾ ਗਾਰੰਟੀਸ਼ੁਦਾ ਕੈਸ਼ਬੈਕ ਪ੍ਰਾਪਤ ਕਰੋ!",
    bn: 'প্রতিটি সফল রেফারেলে ₹১০০ পর্যন্ত নিশ্চিত ক্যাশব্যাক পান!',
  },
  'invite friends now →': {
    en: 'INVITE FRIENDS NOW →',
    hi: 'अभी दोस्तों को आमंत्रित करें →',
    pa: 'ਹੁਣੇ ਦੋਸਤਾਂ ਨੂੰ ਸੱਦਾ ਦਿਓ →',
    bn: 'এখনই বন্ধুদের আমন্ত্রণ জানান →',
  },

  // Popup Modal
  '🎉 special festive offer': {
    en: '🎉 SPECIAL FESTIVE OFFER',
    hi: '🎉 विशेष त्योहारी ऑफर',
    pa: '🎉 ਖਾਸ ਤਿਉਹਾਰੀ ਪੇਸ਼ਕਸ਼',
    bn: '🎉 বিশেষ উৎসবের অফার',
  },
  'flat 10% cashback on all recharges': {
    en: 'Flat 10% Cashback on All Recharges',
    hi: 'सभी रिचार्ज पर फ्लैट 10% कैशबैक',
    pa: 'ਸਾਰੇ ਰੀਚਾਰਜਾਂ ' + "'ਤੇ ਫਲੈਟ 10% ਕੈਸ਼ਬੈਕ",
    bn: 'সমস্ত রিচার্জে ফ্ল্যাট 10% ক্যাশব্যাক',
  },
  'recharge mobile, dth, or pay utility bills today to unlock instant reward balance directly in your wallet!': {
    en: 'Recharge mobile, DTH, or pay utility bills today to unlock instant reward balance directly in your wallet!',
    hi: 'अपने वॉलेट में तुरंत इनाम राशि अनलॉक करने के लिए आज ही मोबाइल, डीटीएच या बिल भरें!',
    pa: 'ਆਪਣੇ ਵਾਲਿਟ ਵਿੱਚ ਤੁਰੰਤ ਇਨਾਮੀ ਬਕਾਇਆ ਅਨਲੌਕ ਕਰਨ ਲਈ ਅੱਜ ਹੀ ਮੋਬਾਈਲ, ਡੀਟੀਐਚ ਜਾਂ ਬਿੱਲਾਂ ਦਾ ਭੁਗਤਾਨ ਕਰੋ!',
    bn: 'আপনার ওয়ালেটে তাত্ক্ষণিক পুরস্কার ব্যালেন্স আনলক করতে আজই মোবাইল, ডিটিএইচ বা ইউটিলিটি বিল পরিশোধ করুন!',
  },
  'recharge & claim now →': {
    en: 'Recharge & Claim Now →',
    hi: 'अभी रिचार्ज करें और क्लेम करें →',
    pa: 'ਹੁਣੇ ਰੀਚਾਰਜ ਕਰੋ ਅਤੇ ਕਲੇਮ ਕਰੋ →',
    bn: 'এখনই রিচার্জ করুন এবং দাবি করুন →',
  },

  // Common Actions
  pay_now: {
    en: 'Pay Now',
    hi: 'अभी भुगतान करें',
    pa: 'ਹੁਣੇ ਭੁਗਤਾਨ ਕਰੋ',
    bn: 'এখনই পেমেন্ট করুন',
  },
  submit: {
    en: 'Submit',
    hi: 'सबमिट करें',
    pa: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    bn: 'জমা দিন',
  },
  cancel: {
    en: 'Cancel',
    hi: 'रद्द करें',
    pa: 'ਰੱਦ ਕਰੋ',
    bn: 'বাতিল করুন',
  },
  proceed: {
    en: 'Proceed',
    hi: 'आगे बढ़ें',
    pa: 'ਅੱਗੇ ਵਧੋ',
    bn: 'এগিয়ে যান',
  },
  continue: {
    en: 'Continue',
    hi: 'जारी रखें',
    pa: 'ਜਾਰੀ ਰੱਖੋ',
    bn: 'চালিয়ে যান',
  },
  save: {
    en: 'Save',
    hi: 'सुरक्षित करें',
    pa: 'ਸੰਭਾਲੋ',
    bn: 'সংরক্ষণ করুন',
  },
  success: {
    en: 'Success',
    hi: 'सफल',
    pa: 'ਸਫਲ',
    bn: 'সফল',
  },
  failed: {
    en: 'Failed',
    hi: 'विफल',
    pa: 'ਅਸਫਲ',
    bn: 'ব্যর্থ',
  },

  // Account / Profile
  commission_chart: {
    en: 'Commission Rates',
    hi: 'कमीशन दरें',
    pa: 'ਕਮਿਸ਼ਨ ਦਰਾਂ',
    bn: 'কমিশন হার',
  },
  change_language: {
    en: 'App Language',
    hi: 'ऐप की भाषा',
    pa: 'ਐਪ ਦੀ ਭਾਸ਼ਾ',
    bn: 'অ্যাপের ভাষা',
  },
  select_language: {
    en: 'Select Language',
    hi: 'भाषा चुनें',
    pa: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    bn: 'ভাষা নির্বাচন করুন',
  },
  logout: {
    en: 'Logout',
    hi: 'लॉग आउट',
    pa: 'ਲਾਗ ਆਉਟ',
    bn: 'লগ আউট',
  },
  contact_support: {
    en: 'Contact Support',
    hi: 'सहायता संपर्क',
    pa: 'ਸਹਾਇਤਾ ਸੰਪਰਕ',
    bn: 'সহায়তা যোগাযোগ',
  },
  privacy_policy: {
    en: 'Privacy Policy',
    hi: 'गोपनीयता नीति',
    pa: 'ਪਰਦੇਦਾਰੀ ਨੀਤੀ',
    bn: 'গোপনীয়তা নীতি',
  },
  terms_conditions: {
    en: 'Terms & Conditions',
    hi: 'नियम और शर्तें',
    pa: 'ਨਿਯਮ ਅਤੇ ਸ਼ਰਤਾਂ',
    bn: 'ਨਿਯਮ ও শর্তাবলী',
  },
  refund_policy: {
    en: 'Refund Policy',
    hi: 'रिफंड नीति',
    pa: 'ਰਿਫੰਡ ਨੀਤੀ',
    bn: 'ফেরত নীতি',
  },

  // Internal Screens: Recharge Screen
  'enter mobile number': {
    en: 'Enter Mobile Number',
    hi: 'मोबाइल नंबर दर्ज करें',
    pa: 'ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    bn: 'মোবাইল নম্বর লিখুন',
  },
  'select contact or enter 10-digit number': {
    en: 'Select contact or enter 10-digit number',
    hi: 'संपर्क चुनें या 10 अंकों का नंबर दर्ज करें',
    pa: 'ਸੰਪਰਕ ਚੁਣੋ ਜਾਂ 10 ਅੰਕਾਂ ਦਾ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    bn: 'পরিচিতি নির্বাচন করুন বা ১০ সংখ্যার নম্বর লিখুন',
  },
  'proceed to select plan': {
    en: 'PROCEED TO SELECT PLAN',
    hi: 'प्लान चुनने के लिए आगे बढ़ें',
    pa: 'ਪਲਾਨ ਚੁਣਨ ਲਈ ਅੱਗੇ ਵਧੋ',
    bn: 'প্ল্যান নির্বাচন করতে এগিয়ে যান',
  },
  'recent recharges': {
    en: 'Recent Recharges',
    hi: 'हाल के रिचार्ज',
    pa: 'ਹਾਲੀਆ ਰੀਚਾਰਜ',
    bn: 'সাম্প্রতিক রিচার্জ',
  },
  '⚡ instant prepaid & postpaid recharge': {
    en: '⚡ Instant Prepaid & Postpaid Recharge',
    hi: '⚡ त्वरित प्रीपेड और पोस्टपेड रिचार्ज',
    pa: '⚡ ਤੁਰੰਤ ਪ੍ਰੀਪੇਡ ਅਤੇ ਪੋਸਟਪੇਡ ਰੀਚਾਰਜ',
    bn: '⚡ তাত্ক্ষণিক প্রিপেইড এবং পোস্টপেইড রিচার্জ',
  },
  repeat: {
    en: 'Repeat',
    hi: 'दोहराएं',
    pa: 'ਦੁਹਰਾਓ',
    bn: 'পুনরাবৃত্তি',
  },
  'select contact': {
    en: 'Select Contact',
    hi: 'संपर्क चुनें',
    pa: 'ਸੰਪਰਕ ਚੁਣੋ',
    bn: 'পরিচিতি নির্বাচন করুন',
  },
  'search by name or number...': {
    en: 'Search by name or number...',
    hi: 'नाम या नंबर से खोजें...',
    pa: 'ਨਾਮ ਜਾਂ ਨੰਬਰ ਦੁਆਰਾ ਖੋਜੋ...',
    bn: 'নাম বা নম্বর দিয়ে খুঁজুন...',
  },
  'enter valid mobile number': {
    en: 'Enter valid mobile number',
    hi: 'मान्य मोबाइल नंबर दर्ज करें',
    pa: 'ਵੈਧ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    bn: 'বৈধ মোবাইল নম্বর লিখুন',
  },
  'operator lookup failed': {
    en: 'Operator lookup failed',
    hi: 'ऑपरेटर लुकअप विफल रहा',
    pa: 'ਆਪਰੇਟਰ ਲੁੱਕਅੱਪ ਅਸਫਲ ਰਿਹਾ',
    bn: 'অপারেটর সন্ধান ব্যর্থ হয়েছে',
  },
  'permission denied': {
    en: 'Permission Denied',
    hi: 'अनुमति अस्वीकृत',
    pa: 'ਇਜਾਜ਼ਤ ਅਸਵੀਕਾਰ ਕੀਤੀ ਗਈ',
    bn: 'অনুমতি অস্বীকার করা হয়েছে',
  },
  'cannot access contacts.': {
    en: 'Cannot access contacts.',
    hi: 'संपर्कों तक नहीं पहुंचा जा सकता।',
    pa: 'ਸੰਪਰਕਾਂ ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ।',
    bn: 'পরিচিতি অ্যাক্সেস করা যাচ্ছে না।',
  },

  // Internal Screens: Wallet Topup
  'add to wallet': {
    en: 'Add to Wallet',
    hi: 'वॉलेट में जोड़ें',
    pa: 'ਵਾਲਿਟ ਵਿੱਚ ਜੋੜੋ',
    bn: 'ওয়ালেটে যোগ করুন',
  },
  'select any amount below': {
    en: 'Select any amount below',
    hi: 'नीचे दी गई राशि चुनें',
    pa: 'ਹੇਠਾਂ ਦਿੱਤੀ ਰਕਮ ਚੁਣੋ',
    bn: 'নিচে যেকোনো পরিমাণ নির্বাচন করুন',
  },
  'add money': {
    en: 'ADD MONEY',
    hi: 'पैसे जोड़ें',
    pa: 'ਪੈਸੇ ਜੋੜੋ',
    bn: 'টাকা যোগ করুন',
  },
  'powered by': {
    en: 'Powered by ',
    hi: 'संचालित ',
    pa: 'ਦੁਆਰਾ ਸੰਚਾਲਿਤ ',
    bn: 'দ্বারা চালিত ',
  },
  'invalid amount': {
    en: 'Invalid Amount',
    hi: 'अमान्य राशि',
    pa: 'ਅਵੈਧ ਰਕਮ',
    bn: 'অবৈধ পরিমাণ',
  },
  'please enter a minimum amount of ₹10': {
    en: 'Please enter a minimum amount of ₹10',
    hi: 'कृपया न्यूनतम ₹10 की राशि दर्ज करें',
    pa: 'ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ ₹10 ਦੀ ਰਕਮ ਦਰਜ ਕਰੋ',
    bn: 'অনুগ্রহ করে ন্যূনতম ₹১০ এর পরিমাণ লিখুন',
  },
  'payment error': {
    en: 'Payment Error',
    hi: 'भुगतान त्रुटि',
    pa: 'ਭੁਗਤਾਨ ਗਲਤੀ',
    bn: 'পেমেন্ট ত্রুটি',
  },

  // Internal Screens: Plan Selection
  'select plan': {
    en: 'Select Plan',
    hi: 'प्लान चुनें',
    pa: 'ਪਲਾਨ ਚੁਣੋ',
    bn: 'প্ল্যান নির্বাচন করুন',
  },
  change: {
    en: 'Change',
    hi: 'बदलें',
    pa: 'ਬਦਲੋ',
    bn: 'পরিবর্তন করুন',
  },
  validity: {
    en: 'Validity',
    hi: 'वैधता',
    pa: 'ਵੈਧਤਾ',
    bn: 'মেয়াদ',
  },
  'search price (e.g. 299, 599)...': {
    en: 'Search price (e.g. 299, 599)...',
    hi: 'कीमत खोजें (जैसे 299, 599)...',
    pa: 'ਕੀਮਤ ਖੋਜੋ (ਜਿਵੇਂ 299, 599)...',
    bn: 'মূল্য অনুসন্ধান করুন (যেমন 299, 599)...',
  },
  'change operator': {
    en: 'Change Operator',
    hi: 'ऑपरेटर बदलें',
    pa: 'ਆਪਰੇਟਰ ਬਦਲੋ',
    bn: 'অপারেটর পরিবর্তন করুন',
  },
  'select operator': {
    en: 'Select Operator',
    hi: 'ऑपरेटर चुनें',
    pa: 'ਆਪਰੇਟਰ ਚੁਣੋ',
    bn: 'অপারেটর নির্বাচন করুন',
  },
  'select circle': {
    en: 'Select Circle',
    hi: 'सर्कल चुनें',
    pa: 'ਸਰਕਲ ਚੁਣੋ',
    bn: 'সার্কেল নির্বাচন করুন',
  },
  apply: {
    en: 'APPLY',
    hi: 'लागू करें',
    pa: 'ਲਾਗੂ ਕਰੋ',
    bn: 'প্রয়োগ করুন',
  },
  close: {
    en: 'CLOSE',
    hi: 'बंद करें',
    pa: 'ਬੰਦ ਕਰੋ',
    bn: 'বন্ধ করুন',
  },

  // Internal Screens: Payment Confirmation
  'payment confirmation': {
    en: 'Payment Confirmation',
    hi: 'भुगतान पुष्टि',
    pa: 'ਭੁਗਤਾਨ ਪੁਸ਼ਟੀ',
    bn: 'পেমেন্ট নিশ্চিতকরণ',
  },
  'payment method': {
    en: 'Payment Method',
    hi: 'भुगतान का तरीका',
    pa: 'ਭੁਗਤਾਨ ਦਾ ਤਰੀਕਾ',
    bn: 'পেমেন্ট পদ্ধতি',
  },
  available: {
    en: 'Available',
    hi: 'उपलब्ध',
    pa: 'ਉਪਲਬਧ',
    bn: 'উপলব্ধ',
  },
  'pay from wallet': {
    en: 'Pay from Wallet',
    hi: 'वॉलेट से भुगतान करें',
    pa: 'ਵਾਲਿਟ ਤੋਂ ਭੁਗਤਾਨ ਕਰੋ',
    bn: 'ওয়ালেট থেকে পেমেন্ট করুন',
  },
  'pay online': {
    en: 'Pay Online',
    hi: 'ऑनलाइन भुगतान करें',
    pa: 'ਆਨਲਾਈਨ ਭੁਗਤਾਨ ਕਰੋ',
    bn: 'অনলাইনে পেমেন্ট করুন',
  },
  'payment summary': {
    en: 'Payment Summary',
    hi: 'भुगतान सारांश',
    pa: 'ਭੁਗਤਾਨ ਸੰਖੇਪ',
    bn: 'পেমেন্ট সারাংশ',
  },
  'plan / bill amount': {
    en: 'Plan / Bill Amount',
    hi: 'प्लान / बिल राशि',
    pa: 'ਪਲਾਨ / ਬਿੱਲ ਰਕਮ',
    bn: 'প্ল্যান / বিলের পরিমাণ',
  },
  'instant commission discount': {
    en: 'Instant Commission Discount',
    hi: 'तत्काल कमीशन छूट',
    pa: 'ਤੁਰੰਤ ਕਮਿਸ਼ਨ ਛੋਟ',
    bn: 'তাত্ক্ষণিক কমিশন ছাড়',
  },
  'convenience fee': {
    en: 'Convenience Fee',
    hi: 'सुविधा शुल्क',
    pa: 'ਸਹੂਲਤ ਫੀਸ',
    bn: 'কনভেনিয়েন্স ফি',
  },
  free: {
    en: 'FREE',
    hi: 'निःशुल्क',
    pa: 'ਮੁਫ਼ਤ',
    bn: 'বিনামূল্যে',
  },
  'net payable': {
    en: 'Net Payable',
    hi: 'कुल देय राशि',
    pa: 'ਕੁੱਲ ਦੇਣਯੋਗ ਰਕਮ',
    bn: 'মোট প্রদেয়',
  },
  'enter your mpin': {
    en: 'Enter your MPIN',
    hi: 'अपना एमपिन (MPIN) दर्ज करें',
    pa: 'ਆਪਣਾ ਐਮਪਿਨ (MPIN) ਦਰਜ ਕਰੋ',
    bn: 'আপনার এমপিআইএন লিখুন',
  },
  'forgot mpin?': {
    en: 'Forgot MPIN?',
    hi: 'एमपिन भूल गए?',
    pa: 'ਐਮਪਿਨ ਭੁੱਲ ਗਏ?',
    bn: 'এমপিআইএন ভুলে গেছেন?',
  },
  'insufficient balance!': {
    en: 'Insufficient Balance!',
    hi: 'अपर्याप्त शेष राशि!',
    pa: 'ਨਾਕਾਫ਼ੀ ਬਕਾਇਆ!',
    bn: 'অপর্যাপ্ত ব্যালেন্স!',
  },
  'low balance': {
    en: 'Low Balance',
    hi: 'कम बैलेंस',
    pa: 'ਘੱਟ ਬਕਾਇਆ',
    bn: 'কম ব্যালেন্স',
  },
  'instant discount applied!': {
    en: 'Instant Discount Applied!',
    hi: 'तत्काल छूट लागू की गई!',
    pa: 'ਤੁਰੰਤ ਛੋਟ ਲਾਗੂ ਕੀਤੀ ਗਈ!',
    bn: 'তাত্ক্ষণিক ছাড় প্রযোজ্য!',
  },

  // Internal Screens: Contact Screen
  'contact us': {
    en: 'Contact Us',
    hi: 'संपर्क करें',
    pa: 'ਸੰਪਰਕ ਕਰੋ',
    bn: 'যোগাযোগ করুন',
  },
  'timing : 11am to 07pm': {
    en: 'Timing : 11AM to 07PM',
    hi: 'समय: सुबह 11 बजे से शाम 7 बजे तक',
    pa: 'ਸਮਾਂ : ਸਵੇਰੇ 11 ਵਜੇ ਤੋਂ ਸ਼ਾਮ 7 ਵਜੇ ਤੱਕ',
    bn: 'সময় : সকাল ১১টা থেকে সন্ধ্যা ৭টা',
  },
  'need help? our support team is here for you.': {
    en: 'Need help? Our support team is here for you.',
    hi: 'मदद चाहिए? हमारी सहायता टीम आपके साथ है।',
    pa: 'ਮਦਦ ਚਾਹੀਦੀ ਹੈ? ਸਾਡੀ ਸਹਾਇਤਾ ਟੀਮ ਤੁਹਾਡੇ ਨਾਲ ਹੈ।',
    bn: 'সাহায্য প্রয়োজন? আমাদের সহায়তা দল আপনার জন্য প্রস্তুত।',
  },
  'how can i help you': {
    en: 'How can I Help You',
    hi: 'हम आपकी क्या मदद कर सकते हैं',
    pa: 'ਅਸੀਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ',
    bn: 'আমরা কীভাবে আপনাকে সাহায্য করতে পারি',
  },
  'call us': {
    en: 'Call Us',
    hi: 'कॉल करें',
    pa: 'ਕਾਲ ਕਰੋ',
    bn: 'কল করুন',
  },
  whatsapp: {
    en: 'Whatsapp',
    hi: 'व्हाट्सएप',
    pa: 'ਵਟਸਐਪ',
    bn: 'হোয়াটসঅ্যাপ',
  },
  'email us': {
    en: 'Email Us',
    hi: 'ईमेल करें',
    pa: 'ਈਮੇਲ ਕਰੋ',
    bn: 'ইমেল করুন',
  },
  "frequently asked question's": {
    en: "Frequently Asked Question's",
    hi: 'अक्सर पूछे जाने वाले सवाल',
    pa: 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ',
    bn: 'সাধারণ জিজ্ঞাসা',
  },
  feedback: {
    en: 'Feedback',
    hi: 'प्रतिक्रिया',
    pa: 'ਫੀਡਬੈਕ',
    bn: 'মতামত',
  },
  'rate us on playstore': {
    en: 'Rate us on Playstore',
    hi: 'प्ले स्टोर पर रेट करें',
    pa: 'ਪਲੇ ਸਟੋਰ ਤੇ ਰੇਟ ਕਰੋ',
    bn: 'প্লে স্টোরে রেট দিন',
  },

  // Internal Screens: Profile & Distributor
  'distributor network': {
    en: 'Distributor Network',
    hi: 'वितरक नेटवर्क',
    pa: 'ਡਿਸਟ੍ਰੀਬਿਊਟਰ ਨੈੱਟਵਰਕ',
    bn: 'ডিস্ট্রিবিউটর নেটওয়ার্ক',
  },
  'my retailers': {
    en: 'My Retailers',
    hi: 'मेरे रिटेलर्स',
    pa: 'ਮੇਰੇ ਰਿਟੇਲਰ',
    bn: 'আমার রিটেইলার',
  },
  'view and manage downline retailer network': {
    en: 'View and manage downline retailer network',
    hi: 'डाउनलाइन रिटेलर नेटवर्क देखें और प्रबंधित करें',
    pa: 'ਡਾਊਨਲਾਈਨ ਰਿਟੇਲਰ ਨੈੱਟਵਰਕ ਦੇਖੋ ਅਤੇ ਪ੍ਰਬੰਧਿਤ ਕਰੋ',
    bn: 'ডাউনলাইন রিটেইলার নেটওয়ার্ক দেখুন ও পরিচালনা করুন',
  },
  'add retailer': {
    en: 'Add Retailer',
    hi: 'रिटेलर जोड़ें',
    pa: 'ਰਿਟੇਲਰ ਸ਼ਾਮਲ ਕਰੋ',
    bn: 'রিটেইলার যোগ করুন',
  },
  'onboard a new retailer under your network': {
    en: 'Onboard a new retailer under your network',
    hi: 'अपने नेटवर्क के तहत एक नए रिटेलर को जोड़ें',
    pa: 'ਆਪਣੇ ਨੈੱਟਵਰਕ ਅਧੀਨ ਨਵਾਂ ਰਿਟੇਲਰ ਸ਼ਾਮਲ ਕਰੋ',
    bn: 'আপনার নেটওয়ার্কে নতুন রিটেইলার যুক্ত করুন',
  },
  'services & earnings': {
    en: 'Services & Earnings',
    hi: 'सेवाएं और कमाई',
    pa: 'ਸੇਵਾਵਾਂ ਅਤੇ ਕਮਾਈ',
    bn: 'পরিষেবা ও আয়',
  },
  'support & feedback': {
    en: 'Support & Feedback',
    hi: 'सहायता और प्रतिक्रिया',
    pa: 'ਸਹਾਇਤਾ ਅਤੇ ਫੀਡਬੈਕ',
    bn: 'সহায়তা ও প্রতিক্রিয়া',
  },
  'legal & compliance': {
    en: 'Legal & Compliance',
    hi: 'कानूनी और अनुपालन',
    pa: 'ਕਾਨੂੰਨੀ ਅਤੇ ਪਾਲਣਾ',
    bn: 'আইনি ও সম্মতি',
  },
  'verified partner': {
    en: 'Verified Partner',
    hi: 'सत्यापित भागीदार',
    pa: 'ਪ੍ਰਮਾਣਿਤ ਸਾਥੀ',
    bn: 'যাচাইকৃত অংশীদার',
  },
  'distributor partner': {
    en: 'Distributor Partner',
    hi: 'वितरक भागीदार',
    pa: 'ਡਿਸਟ੍ਰੀਬਿਊਟਰ ਸਾਥੀ',
    bn: 'ডিস্ট্রিবিউটর অংশীদার',
  },
  'feedback & suggestions': {
    en: 'Feedback & Suggestions',
    hi: 'प्रतिक्रिया और सुझाव',
    pa: 'ਫੀਡਬੈਕ ਅਤੇ ਸੁਝਾਅ',
    bn: 'মতামত ও পরামর্শ',
  },
  'about online adda': {
    en: 'About Online Adda',
    hi: 'ऑनलाइन अड्डा के बारे में',
    pa: 'ਆਨਲਾਈਨ ਅੱਡਾ ਬਾਰੇ',
    bn: 'অনলাইন আড্ডা সম্পর্কে',
  },
  'grievance redressal': {
    en: 'Grievance Redressal',
    hi: 'शिकायत निवारण',
    pa: 'ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਨ',
    bn: 'অভিযোগ প্রতিকার',
  },
  'faq\'s & guides': {
    en: "FAQ's & Guides",
    hi: 'एफएक्यू और गाइड',
    pa: 'ਸਵਾਲ-ਜਵਾਬ ਅਤੇ ਗਾਈਡ',
    bn: 'জিজ্ঞাসা ও নির্দেশিকা',
  },

  // Internal Screens: Reports & History
  'reports & history': {
    en: 'Reports & History',
    hi: 'रिपोर्ट्स और इतिहास',
    pa: 'ਰਿਪੋਰਟਾਂ ਅਤੇ ਇਤਿਹਾਸ',
    bn: 'রিপোর্ট এবং ইতিহাস',
  },
  bills: {
    en: 'Bills',
    hi: 'बिल',
    pa: 'ਬਿੱਲ',
    bn: 'বিল',
  },
  ledger: {
    en: 'Ledger',
    hi: 'खाता बही (लेज़र)',
    pa: 'ਖਾਤਾ ਬਹੀ (ਲੈਜ਼ਰ)',
    bn: 'খতিয়ান (লেজার)',
  },
  filters: {
    en: 'Filters',
    hi: 'फ़िल्टर',
    pa: 'ਫਿਲਟਰ',
    bn: 'ফিল্টার',
  },
  'from date': {
    en: 'From Date',
    hi: 'आरंभिक तिथि',
    pa: 'ਸ਼ੁਰੂਆਤੀ ਮਿਤੀ',
    bn: 'শুরুর তারিখ',
  },
  'to date': {
    en: 'To Date',
    hi: 'अंतिम तिथि',
    pa: 'ਆਖਰੀ ਮਿਤੀ',
    bn: 'শেষ তারিখ',
  },
  'apply filter': {
    en: 'Apply Filter',
    hi: 'फ़िल्टर लागू करें',
    pa: 'ਫਿਲਟਰ ਲਾਗੂ ਕਰੋ',
    bn: 'ফিল্টার প্রয়োগ করুন',
  },
  reset: {
    en: 'Reset',
    hi: 'रीसेट',
    pa: 'ਰੀਸੈਟ',
    bn: 'রিসেট',
  },
  'txn id': {
    en: 'Txn ID',
    hi: 'लेनदेन आईडी',
    pa: 'ਲੈਣ-ਦੇਣ ਆਈਡੀ',
    bn: 'লেনদেন আইডি',
  },
  'paid from': {
    en: 'Paid From',
    hi: 'भुगतान स्रोत',
    pa: 'ਭੁਗਤਾਨ ਸਰੋਤ',
    bn: 'পেমেন্ট উৎস',
  },
  'no transactions found': {
    en: 'No Transactions Found',
    hi: 'कोई लेनदेन नहीं मिला',
    pa: 'ਕੋਈ ਲੈਣ-ਦੇਣ ਨਹੀਂ ਮਿਲਿਆ',
    bn: 'কোনো লেনদেন পাওয়া যায়নি',
  },

  // Internal Screens: DTH / BBPS / Fastag
  'customer id': {
    en: 'Customer ID',
    hi: 'ग्राहक आईडी',
    pa: 'ਗਾਹਕ ਆਈਡੀ',
    bn: 'গ্রাহক আইডি',
  },
  verify: {
    en: 'VERIFY',
    hi: 'सत्यापित करें',
    pa: 'ਪ੍ਰਮਾਣਿਤ ਕਰੋ',
    bn: 'যাচাই করুন',
  },
  'enter amount': {
    en: 'Enter Amount',
    hi: 'राशि दर्ज करें',
    pa: 'ਰਕਮ ਦਰਜ ਕਰੋ',
    bn: 'পরিমাণ লিখুন',
  },
  price: {
    en: 'Price',
    hi: 'कीमत',
    pa: 'ਕੀਮਤ',
    bn: 'মূল্য',
  },
  'fetch bill': {
    en: 'FETCH BILL',
    hi: 'बिल लाएं',
    pa: 'ਬਿੱਲ ਲਿਆਓ',
    bn: 'বিল আনুন',
  },
  'consumer number': {
    en: 'Consumer Number',
    hi: 'उपभोक्ता संख्या',
    pa: 'ਖਪਤਕਾਰ ਨੰਬਰ',
    bn: 'গ্রাহক নম্বর',
  },
  'connection number': {
    en: 'Connection Number',
    hi: 'कनेक्शन नंबर',
    pa: 'ਕਨੈਕਸ਼ਨ ਨੰਬਰ',
    bn: 'সংযোগ নম্বর',
  },
  'total bill due': {
    en: 'TOTAL BILL DUE',
    hi: 'कुल बकाया बिल',
    pa: 'ਕੁੱਲ ਬਕਾਇਆ ਬਿੱਲ',
    bn: 'মোট বকেয়া বিল',
  },
  'bill breakdown': {
    en: 'Bill Breakdown',
    hi: 'बिल विवरण',
    pa: 'ਬਿੱਲ ਵੇਰਵਾ',
    bn: 'বিল বিবরণ',
  },
  'consumer name': {
    en: 'Consumer Name',
    hi: 'उपभोक्ता का नाम',
    pa: 'ਖਪਤਕਾਰ ਦਾ ਨਾਮ',
    bn: 'গ্রাহকের নাম',
  },
  'bill date': {
    en: 'Bill Date',
    hi: 'बिल तिथि',
    pa: 'ਬਿੱਲ ਮਿਤੀ',
    bn: 'বিল তারিখ',
  },
  'payment due date': {
    en: 'Payment Due Date',
    hi: 'भुगतान की अंतिम तिथि',
    pa: 'ਭੁਗਤਾਨ ਦੀ ਆਖਰੀ ਮਿਤੀ',
    bn: 'পেমেন্টের শেষ তারিখ',
  },
};

// In-memory cache for live dynamic translations
const memoryTranslationCache = new Map();

// Listeners for reactive language changes
const languageListeners = new Set();

let currentLanguage = 'en';

/**
 * Initialize current language from AsyncStorage
 */
export const initLanguageService = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      currentLanguage = saved;
    }
  } catch (e) {
    console.warn('Could not read saved language:', e);
  }
  return currentLanguage;
};

/**
 * Get current active language code ('en', 'hi', 'pa', 'bn')
 */
export const getAppLanguage = () => currentLanguage;

/**
 * Get language metadata object
 */
export const getLanguageInfo = (code = currentLanguage) => {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
};

/**
 * Set and persist active language code ('en', 'hi', 'pa', 'bn')
 */
export const setAppLanguage = async (langCode) => {
  const match = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  if (!match) {
    throw new Error(`Unsupported language: ${langCode}. Supported: en, hi, pa, bn`);
  }

  currentLanguage = langCode;
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
  } catch (err) {
    console.error('Failed to save language to storage:', err);
  }

  // Notify all active listeners
  languageListeners.forEach(listener => {
    try {
      listener(currentLanguage);
    } catch (e) {
      console.warn('Language listener error:', e);
    }
  });

  return currentLanguage;
};

/**
 * Subscribe to language change events
 */
export const subscribeLanguageChange = (callback) => {
  languageListeners.add(callback);
  return () => {
    languageListeners.delete(callback);
  };
};

/**
 * Normalizes text to lookup in dictionary
 */
const normalizeLookupKey = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().toLowerCase();
};

/**
 * Universal Synchronous Translation Helper
 * Converts any hardcoded text or dictionary key into the active language.
 *
 * @param {string} keyOrText - Key (e.g. 'wallet_balance') or literal English phrase (e.g. 'All Services', 'HAR GHAR DIGITAL')
 * @param {string} [fallback] - Fallback text if not found
 * @param {string} [targetLang] - Optional override language
 */
export const t = (keyOrText, fallback = '', targetLang = currentLanguage) => {
  if (!keyOrText) return '';
  if (typeof keyOrText !== 'string') return String(keyOrText);

  // 1. Direct exact lookup
  if (DICTIONARY[keyOrText] && DICTIONARY[keyOrText][targetLang]) {
    return DICTIONARY[keyOrText][targetLang];
  }

  // 2. Normalized lowercase lookup
  const normalized = normalizeLookupKey(keyOrText);
  if (DICTIONARY[normalized] && DICTIONARY[normalized][targetLang]) {
    return DICTIONARY[normalized][targetLang];
  }

  // 3. Snake-case normalized lookup (e.g. 'All Services' -> 'all_services')
  const snakeKey = normalized.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (DICTIONARY[snakeKey] && DICTIONARY[snakeKey][targetLang]) {
    return DICTIONARY[snakeKey][targetLang];
  }

  // 4. Memory cache from online translations
  const cacheKey = `en_${targetLang}_${keyOrText.trim()}`;
  if (memoryTranslationCache.has(cacheKey)) {
    return memoryTranslationCache.get(cacheKey);
  }

  // 5. Fallback
  return fallback || keyOrText;
};

/**
 * Live Translation API: Converts any text string dynamically between English, Hindi, Punjabi, Bengali.
 * Uses Google Translate API with MyMemory fallback and caching.
 *
 * @param {string} text - Text to translate
 * @param {string} [targetLang] - Destination language code ('en', 'hi', 'pa', 'bn')
 * @param {string} [sourceLang='auto'] - Source language code
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, targetLang = currentLanguage, sourceLang = 'auto') => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return text || '';
  }

  const cleanText = text.trim();

  // If source and target are the same (or target is 'en' and text is english), return clean text
  if (sourceLang === targetLang) {
    return cleanText;
  }

  // 1. Check if dictionary matches this text (instant)
  const dictMatch = t(cleanText, '', targetLang);
  if (dictMatch && dictMatch !== cleanText) {
    return dictMatch;
  }

  // 2. Check in-memory cache
  const cacheKey = `${sourceLang}_${targetLang}_${cleanText}`;
  if (memoryTranslationCache.has(cacheKey)) {
    return memoryTranslationCache.get(cacheKey);
  }

  // 3. Call Live Translation API (Google Translate primary)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      cleanText,
    )}`;

    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      },
    });
    if (response?.data && Array.isArray(response.data[0])) {
      const translatedParts = response.data[0].map(item => item[0]).filter(Boolean);
      const translated = translatedParts.join('').trim();

      if (translated) {
        memoryTranslationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (apiErr) {
    // Attempt fallback to MyMemory Translate API
    try {
      const pair = `${sourceLang === 'auto' ? 'en' : sourceLang}|${targetLang}`;
      const myMemoryRes = await axios.get('https://api.mymemory.translated.net/get', {
        params: { q: cleanText, langpair: pair },
        timeout: 5000,
      });
      const translated = myMemoryRes?.data?.responseData?.translatedText?.trim();
      if (translated && !translated.includes('MYMEMORY WARNING')) {
        memoryTranslationCache.set(cacheKey, translated);
        return translated;
      }
    } catch (fallbackErr) {
      console.warn(`Translation fallback error (${cleanText}):`, fallbackErr?.message);
    }
  }

  // Fallback to original text if both online services fail
  return cleanText;
};

/**
 * Batch translation API for multiple texts
 * @param {string[]} texts - Array of strings
 * @param {string} [targetLang] - Destination language
 * @param {string} [sourceLang='auto'] - Source language
 */
export const translateBatch = async (texts, targetLang = currentLanguage, sourceLang = 'auto') => {
  if (!Array.isArray(texts)) return [];
  return Promise.all(texts.map(txt => translateText(txt, targetLang, sourceLang)));
};
