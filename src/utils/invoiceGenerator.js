/**
 * Pastry Paws Artisan Bakery
 * Dynamic Invoice & Bill PDF Generator
 * Dynamically fetches live order records from MongoDB Atlas database.
 */

import { brandConfig } from '../data/brand';
import { API_BASE_URL } from './api';
import { getCachedPaymentConfig } from './paymentConfig';

/**
 * Dynamically fetches the latest, authoritative order record from the database.
 * Supports lookup by orderId (e.g. "PP-360217") or Mongo _id.
 */
export async function fetchOrderFromDatabase(orderIdOrId) {
  if (!orderIdOrId) return null;
  const targetId =
    typeof orderIdOrId === 'string'
      ? orderIdOrId.trim()
      : (orderIdOrId.orderId || orderIdOrId._id || '').toString().trim();

  if (!targetId) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(targetId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch fresh order from database, falling back to local data:', err);
  }
  return typeof orderIdOrId === 'object' ? orderIdOrId : null;
}

/**
 * Generates an elegant, printable HTML invoice for an order.
 * Features luxury boutique typography, official bakery seal, dynamic QR code, and full payment details.
 */
export function generateOrderInvoiceHtml(order) {
  const paymentConfig = getCachedPaymentConfig();
  const invoiceNo = `INV-${order.orderId || 'PP-OFFICIAL'}`;
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';

  const rawPriceStr = (order.price || '0').replace(/[^0-9.]/g, '');
  const numericPrice = parseFloat(rawPriceStr) || 0;
  const formattedPrice = `₹${numericPrice.toFixed(2)}`;

  // Payment Status Styling
  const paymentStatus = order.paymentStatus || 'pending_verification';
  const isPaid = paymentStatus === 'verified';
  const isRejected = paymentStatus === 'rejected';

  const statusBadgeText = isPaid
    ? 'PAID & VERIFIED (UPI)'
    : isRejected
      ? 'VERIFICATION REJECTED'
      : 'PAYMENT UNDER VERIFICATION';

  const statusBadgeColor = isPaid
    ? '#1B5E20'
    : isRejected
      ? '#B71C1C'
      : '#B78103';

  const statusBadgeBg = isPaid
    ? '#E8F5E9'
    : isRejected
      ? '#FFEBEE'
      : '#FFF8E1';

  const statusBadgeBorder = isPaid
    ? '#81C784'
    : isRejected
      ? '#EF9A9A'
      : '#FFE082';

  // Live tracking URL encoded in QR Code
  const trackingUrl = `https://pastrypaws.com/track-order?phone=${encodeURIComponent(
    order.customerPhone || ''
  )}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=2&data=${encodeURIComponent(
    trackingUrl
  )}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${invoiceNo} - Pastry Paws Artisan Bakery</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    :root {
      --primary: #7C3F27;
      --primary-dark: #411C10;
      --accent-warm: #FEEDDD;
      --bg-cream: #FFFDF9;
      --border-tone: rgba(210, 156, 131, 0.4);
      --text-main: #2C1810;
      --text-muted: #7C3F27;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F6EDE6;
      color: var(--text-main);
      padding: 30px 15px;
      -webkit-font-smoothing: antialiased;
    }

    .invoice-wrapper {
      max-width: 840px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 24px;
      padding: 44px 48px;
      box-shadow: 0 14px 45px rgba(65, 28, 16, 0.08);
      border: 1px solid var(--border-tone);
      position: relative;
    }

    /* Subtle Authenticity Watermark */
    .invoice-wrapper::after {
      content: 'PASTRY PAWS';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-28deg);
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 86px;
      font-weight: 800;
      color: rgba(124, 63, 39, 0.025);
      letter-spacing: 14px;
      pointer-events: none;
      z-index: 0;
    }

    .content-layer {
      position: relative;
      z-index: 1;
    }

    /* Screen-Only Action Bar */
    .print-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      background: #FEEDDD;
      padding: 14px 22px;
      border-radius: 16px;
      border: 1px solid rgba(210, 156, 131, 0.6);
      box-shadow: 0 2px 8px rgba(124, 63, 39, 0.06);
    }

    .print-title {
      font-size: 13px;
      color: #411C10;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .print-btn {
      background: #7C3F27;
      color: #FFF9F3;
      border: none;
      padding: 10px 22px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(124, 63, 39, 0.25);
      transition: all 0.2s ease;
    }

    .print-btn:hover {
      background: #5E2B19;
      transform: translateY(-1px);
    }

    /* Header Section */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px dashed #FEEDDD;
      padding-bottom: 28px;
      margin-bottom: 28px;
      gap: 20px;
    }

    .brand-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      color: #411C10;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-tagline {
      font-size: 13px;
      color: #7C3F27;
      font-weight: 600;
      margin-top: 4px;
      letter-spacing: 0.3px;
    }

    .studio-details {
      font-size: 12px;
      color: #6E4738;
      line-height: 1.6;
      margin-top: 10px;
    }

    .invoice-badge-box {
      text-align: right;
    }

    .invoice-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 800;
      color: #7C3F27;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .invoice-meta {
      font-size: 12px;
      color: #6E4738;
      margin-top: 8px;
      line-height: 1.7;
    }

    .invoice-meta strong {
      color: #411C10;
    }

    .status-pill {
      display: inline-block;
      margin-top: 8px;
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      background: ${statusBadgeBg};
      color: ${statusBadgeColor};
      border: 1px solid ${statusBadgeBorder};
    }

    /* UPI Payment Highlight Banner */
    .payment-highlight-banner {
      background: linear-gradient(135deg, #FFF9F3 0%, #FEEDDD 100%);
      border: 1px solid rgba(210, 156, 131, 0.45);
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 26px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
    }

    .payment-highlight-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .payment-highlight-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #A66D54;
    }

    .payment-highlight-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: #411C10;
    }

    .payment-highlight-value.utr {
      color: #7C3F27;
      background: #FFFFFF;
      padding: 3px 10px;
      border-radius: 8px;
      border: 1px solid rgba(210, 156, 131, 0.35);
      display: inline-block;
    }

    /* Customer & Destination Grid */
    .billing-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      background: #FFFDF9;
      padding: 22px 24px;
      border-radius: 18px;
      border: 1px solid var(--border-tone);
      margin-bottom: 26px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #7C3F27;
      margin-bottom: 10px;
      display: block;
      border-bottom: 1px solid rgba(210, 156, 131, 0.25);
      padding-bottom: 4px;
    }

    .info-line {
      font-size: 13px;
      color: #331A12;
      line-height: 1.65;
    }

    .info-line strong {
      font-weight: 700;
      color: #411C10;
    }

    /* Itemized Table */
    .items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 24px;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border-tone);
    }

    .items-table th {
      background: #7C3F27;
      color: #FFF9F3;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 14px 18px;
      text-align: left;
    }

    .items-table td {
      padding: 16px 18px;
      font-size: 13px;
      border-bottom: 1px solid #FEEDDD;
      color: #411C10;
      vertical-align: middle;
    }

    .items-table tbody tr:last-child td {
      border-bottom: none;
    }

    .item-title {
      font-weight: 700;
      font-size: 14px;
      color: #411C10;
    }

    .item-subtitle {
      font-size: 11px;
      color: #7C3F27;
      margin-top: 3px;
      line-height: 1.4;
    }

    /* Summary & Totals */
    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 24px;
      gap: 26px;
    }

    .notes-box {
      flex: 1;
      background: #FFFDF9;
      padding: 18px 20px;
      border-radius: 16px;
      border: 1px dashed rgba(210, 156, 131, 0.5);
      font-size: 12px;
      line-height: 1.65;
      color: #6E4738;
    }

    .notes-box strong {
      color: #411C10;
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
    }

    .totals-box {
      width: 320px;
      background: #FFFDF9;
      border-radius: 16px;
      padding: 20px 22px;
      border: 1px solid var(--border-tone);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #6E4738;
      padding: 6px 0;
    }

    .total-row.grand-total {
      border-top: 2px solid #7C3F27;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 15px;
      font-weight: 700;
      color: #411C10;
    }

    .total-row.grand-total .amount {
      color: #7C3F27;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      font-weight: 800;
    }

    /* Verification QR & Authenticity Seal */
    .seal-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 26px;
      padding-top: 20px;
      border-top: 1px solid rgba(210, 156, 131, 0.3);
      gap: 20px;
    }

    .qr-box {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .qr-img {
      width: 76px;
      height: 76px;
      border-radius: 10px;
      border: 1px solid var(--border-tone);
      background: #FFFFFF;
      padding: 2px;
    }

    .qr-text {
      font-size: 11px;
      color: #6E4738;
      line-height: 1.5;
    }

    .qr-text strong {
      color: #411C10;
      display: block;
    }

    .bakery-seal {
      text-align: right;
      font-size: 11px;
      color: #7C3F27;
      line-height: 1.5;
    }

    .seal-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #7C3F27;
      border: 1px solid #7C3F27;
      padding: 3px 10px;
      border-radius: 6px;
      margin-bottom: 4px;
    }

    /* Footer */
    .invoice-footer {
      border-top: 2px dashed #FEEDDD;
      margin-top: 28px;
      padding-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #7C3F27;
      line-height: 1.7;
    }

    .footer-highlight {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 14px;
      font-style: italic;
      color: #411C10;
      margin-bottom: 4px;
    }

    /* Print Media Styling for Crisp 1-Page A4 PDF */
    @media print {
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .invoice-wrapper {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .print-bar {
        display: none !important;
      }
      @page {
        size: A4 portrait;
        margin: 14mm 14mm 14mm 14mm;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Screen-only Print Bar -->
    <div class="print-bar">
      <div class="print-title">
        <span>🧁 Pastry Paws Official Customer Invoice</span>
      </div>
      <button class="print-btn" onclick="window.print()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>Download PDF / Print</span>
      </button>
    </div>

    <div class="content-layer">
      <!-- Invoice Header -->
      <header class="invoice-header">
        <div>
          <h1 class="brand-title">
            <span>🐾 Pastry Paws</span>
          </h1>
          <p class="brand-tagline">Artisanal Bakery & Handcrafted Gourmet Treats</p>
          <div class="studio-details">
            <p>Freshly baked from our studio kitchen</p>
            <p>WhatsApp & Phone: +91 ${paymentConfig.phoneNumber || brandConfig.contact?.phone || '9790983844'} • Email: ${brandConfig.contact?.email || 'pastrypaws012@gmail.com'}</p>
            <p>Official Bakery UPI: <strong>${paymentConfig.upiId || brandConfig.payment?.upiId || '9790983844@okaxis'}</strong></p>
            <p>Website: pastrypaws.com</p>
          </div>
        </div>

        <div class="invoice-badge-box">
          <div class="invoice-title">TAX INVOICE</div>
          <div class="invoice-meta">
            <p><strong>Invoice No:</strong> #${invoiceNo}</p>
            <p><strong>Order ID:</strong> #${order.orderId}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            ${orderTime ? `<p><strong>Time:</strong> ${orderTime}</p>` : ''}
            <div>
              <span class="status-pill">${statusBadgeText}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Payment & Transaction Details Highlight Banner -->
      <div class="payment-highlight-banner">
        <div class="payment-highlight-item">
          <span class="payment-highlight-label">Payment Mode</span>
          <span class="payment-highlight-value">${order.paymentMethod || 'Google Pay / UPI'}</span>
        </div>

        <div class="payment-highlight-item">
          <span class="payment-highlight-label">UPI Reference / UTR Number</span>
          <span class="payment-highlight-value utr">${order.transactionId || 'PENDING VERIFICATION'}</span>
        </div>

        <div class="payment-highlight-item">
          <span class="payment-highlight-label">Payment Status</span>
          <span class="payment-highlight-value" style="color: ${statusBadgeColor};">
            ${isPaid ? 'Verified & Received' : isRejected ? 'Rejected by Studio' : 'Under Review'}
          </span>
        </div>

        <div class="payment-highlight-item">
          <span class="payment-highlight-label">Amount Paid</span>
          <span class="payment-highlight-value" style="color: #7C3F27;">${formattedPrice}</span>
        </div>
      </div>

      <!-- Customer & Delivery Details Grid -->
      <div class="billing-grid">
        <div>
          <span class="section-label">Billed To (Customer Details)</span>
          <p class="info-line"><strong>${order.customerName || 'Valued Guest'}</strong></p>
          <p class="info-line">Registered Phone: <strong>+91 ${order.customerPhone || 'N/A'}</strong></p>
          <p class="info-line">Order Ref: <strong>#${order.orderId}</strong></p>
          <p class="info-line">Transaction UTR: <strong style="font-family: 'JetBrains Mono', monospace;">${order.transactionId || 'N/A'}</strong></p>
        </div>

        <div>
          <span class="section-label">Delivery Destination & Schedule</span>
          <p class="info-line"><strong>Address:</strong> ${order.deliveryAddress || 'Standard Studio Pickup'}</p>
          ${order.deliveryDate ? `<p class="info-line"><strong>Preferred Date:</strong> ${order.deliveryDate}</p>` : ''}
          ${order.deliveryTime ? `<p class="info-line"><strong>Preferred Slot:</strong> ${order.deliveryTime}</p>` : ''}
          <p class="info-line">Kitchen Status: <strong>${(order.status || 'pending').toUpperCase()}</strong></p>
        </div>
      </div>

      <!-- Itemized Table Breakdown -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 48%;">Item & Particulars</th>
            <th style="width: 20%; text-align: center;">Portion / Size</th>
            <th style="width: 12%; text-align: center;">Qty</th>
            <th style="width: 20%; text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-title">${order.itemTitle}</div>
              <div class="item-subtitle">
                ${order.category ? `Category: ${order.category} • ` : ''}100% Handcrafted Artisan Studio Recipe
              </div>
            </td>
            <td style="text-align: center; font-weight: 700; color: #411C10;">${order.selectedSize || 'Standard'}</td>
            <td style="text-align: center; font-weight: 600;">1</td>
            <td style="text-align: right; font-weight: 700; color: #7C3F27; font-size: 14px;">${formattedPrice}</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary & Notes -->
      <div class="summary-section">
        <div class="notes-box">
          <strong>Customer Special Instructions / Notes:</strong>
          <p>${order.notes ? `"${order.notes}"` : 'No special customization requested. Freshly prepared per standard studio recipe.'}</p>
          ${order.paymentRejectedReason ? `<p style="margin-top: 8px; color: #B71C1C; font-weight: 600;">* Bakery Payment Notice: "${order.paymentRejectedReason}"</p>` : ''}
          <p style="margin-top: 10px; font-size: 11px; color: #8C533C;">
            * Handcrafted fresh treats without artificial preservatives. Best enjoyed within 48 hours. Keep refrigerated if cream-based.
          </p>
        </div>

        <div class="totals-box">
          <div class="total-row">
            <span>Item Subtotal:</span>
            <span>${formattedPrice}</span>
          </div>
          <div class="total-row">
            <span>Artisan Packaging:</span>
            <span style="color: #2E7D32; font-weight: 700;">Complimentary (₹0.00)</span>
          </div>
          <div class="total-row">
            <span>Studio Delivery:</span>
            <span style="color: #2E7D32; font-weight: 700;">Included (₹0.00)</span>
          </div>
          <div class="total-row">
            <span>GST / Taxes:</span>
            <span style="color: #6E4738;">Inclusive</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Payable / Paid:</span>
            <span class="amount">${formattedPrice}</span>
          </div>
        </div>
      </div>

      <!-- Authenticity Seal & Scan to Track -->
      <div class="seal-section">
        <div class="qr-box">
          <img src="${qrCodeUrl}" alt="Live Order Tracking QR" class="qr-img" />
          <div class="qr-text">
            <strong>Scan to Track Live Order</strong>
            <span>Scan with any camera or UPI app to track live baking and delivery status online.</span>
          </div>
        </div>

        <div class="bakery-seal">
          <div class="seal-badge">AUTHENTICATED BAKE</div>
          <p><strong>Pastry Paws </strong></p>
          <p> </p>
        </div>
      </div>

      <!-- Invoice Footer -->
      <footer class="invoice-footer">
        <p class="footer-highlight">"Baked with love, crafted for your special moments."</p>
        <p>Thank you for choosing Pastry Paws! For urgent support or custom celebrations, WhatsApp us at +91 97909 83844.</p>
      </footer>
    </div>
  </div>

  <script>
    // Auto-trigger print dialog if opened in dedicated window
    if (window.location.search.includes('autoprint=true')) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          window.print();
        }, 400);
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Dynamically fetches fresh order details from the database and triggers the print / Save-as-PDF window.
 * If network is offline, gracefully uses the passed order object.
 */
export async function printOrderInvoice(orderOrId) {
  if (!orderOrId) return;

  // Dynamically fetch the fresh record from MongoDB Atlas database
  let latestOrder = null;
  try {
    latestOrder = await fetchOrderFromDatabase(orderOrId);
  } catch (e) {
    console.warn('Dynamic invoice fetch failed, fallback to in-memory:', e);
  }

  // Fallback to in-memory order if fetch yielded null
  const finalOrder = latestOrder || (typeof orderOrId === 'object' ? orderOrId : { orderId: orderOrId });
  const htmlContent = generateOrderInvoiceHtml(finalOrder);

  const printWindow = window.open('', '_blank', 'width=900,height=960,menubar=no,toolbar=no');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  } else {
    // Fallback: If popups blocked, use hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    let doc = iframe.contentWindow || iframe.contentDocument;
    if (doc.document) doc = doc.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
    }, 500);
  }
}
