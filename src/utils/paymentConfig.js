import { API_BASE_URL } from './api';
import { brandConfig } from '../data/brand';

const CACHE_KEY = 'pastry_paws_payment_config';

export const DEFAULT_PAYMENT_CONFIG = {
  upiId: brandConfig.payment?.upiId || '9790983844@okaxis',
  payeeName: brandConfig.payment?.payeeName || 'Pastry Paws',
  phoneNumber: brandConfig.contact?.phone || '9790983844',
  whatsappNumber: brandConfig.contact?.whatsappNumber || '919790983844',
  qrCodeImage: '',
  qrCodePublicId: '',
  qrMode: 'dynamic', // 'dynamic' | 'custom'
  instructions:
    'Pay using Google Pay, PhonePe, Paytm, or BHIM. Take a screenshot of the successful payment screen and note down the 12-digit UPI UTR / Transaction ID.',
};

/**
 * Get cached payment config synchronously for immediate initial render
 */
export function getCachedPaymentConfig() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return { ...DEFAULT_PAYMENT_CONFIG, ...JSON.parse(cached) };
    }
  } catch (err) {
    console.warn('Error reading cached payment config:', err);
  }
  return DEFAULT_PAYMENT_CONFIG;
}

/**
 * Fetch authoritative payment configuration from backend
 */
export async function fetchPaymentConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/payment-config`);
    const json = await res.json();
    if (json.success && json.data) {
      const merged = { ...DEFAULT_PAYMENT_CONFIG, ...json.data };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.warn('Error caching payment config:', err);
      }
      return merged;
    }
  } catch (err) {
    console.warn('Failed to fetch payment config from backend, using fallback:', err);
  }
  return getCachedPaymentConfig();
}

/**
 * Save updated payment configuration (Admin only)
 */
export async function savePaymentConfig(configData) {
  const res = await fetch(`${API_BASE_URL}/api/payment-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configData),
  });

  const json = await res.json();
  if (json.success && json.data) {
    const merged = { ...DEFAULT_PAYMENT_CONFIG, ...json.data };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
    } catch (err) {
      console.warn('Error caching updated payment config:', err);
    }
    return merged;
  }
  throw new Error(json.message || 'Failed to update payment settings');
}
