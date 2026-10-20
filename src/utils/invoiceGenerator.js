/**
 * Pastry Paws Artisan Bakery
 * Invoice & Bill PDF Generator
 */

import { brandConfig } from '../data/brand';

/**
 * Generates an elegant, printable HTML invoice for an order.
 * Triggers browser print dialog for instant "Save as PDF" with perfect vector typography.
 */
export function generateOrderInvoiceHtml(order) {
  const invoiceNo = `INV-${order.orderId || 'PP'}`;
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${invoiceNo} - Pastry Paws</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    :root {
      --primary: #7C3F27;
      --primary-dark: #411C10;
      --bg-cream: #FFF9F3;
      --accent-warm: #FEEDDD;
      --border-tone: #D29C83;
      --text-muted: #7C3F27;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F7EFE9;
      color: #331A12;
      padding: 30px 15px;
      -webkit-font-smoothing: antialiased;
    }

    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 10px 40px rgba(65, 28, 16, 0.08);
      border: 1px solid rgba(210, 156, 131, 0.35);
      position: relative;
    }

    /* Watermark */
    .invoice-wrapper::after {
      content: 'PASTRY PAWS';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 80px;
      font-weight: 700;
      color: rgba(124, 63, 39, 0.03);
      letter-spacing: 12px;
      pointer-events: none;
      z-index: 0;
    }

    .content-layer {
      position: relative;
      z-index: 1;
    }

    /* Print Controls */
    .print-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      background: #FEEDDD;
      padding: 12px 20px;
      border-radius: 14px;
      border: 1px solid #D29C83;
    }

    .print-btn {
      background: #7C3F27;
      color: #FFF9F3;
      border: none;
      padding: 10px 22px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(124, 63, 39, 0.25);
      transition: background 0.2s;
    }

    .print-btn:hover {
      background: #5E2B19;
    }

    /* Header Section */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #FEEDDD;
      padding-bottom: 30px;
      margin-bottom: 30px;
    }

    .brand-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      color: #411C10;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-tagline {
      font-size: 13px;
      color: #7C3F27;
      font-weight: 500;
      margin-top: 4px;
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
      font-weight: 700;
      color: #7C3F27;
      letter-spacing: 1px;
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
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #E8F5E9;
      color: #1B5E20;
      border: 1px solid #A5D6A7;
    }

    /* Client & Delivery Grid */
    .billing-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      background: #FFF9F3;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(210, 156, 131, 0.3);
      margin-bottom: 30px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #7C3F27;
      margin-bottom: 10px;
      display: block;
    }

    .info-line {
      font-size: 13px;
      color: #331A12;
      line-height: 1.6;
    }

    .info-line strong {
      font-weight: 600;
      color: #411C10;
    }

    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 24px;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid rgba(210, 156, 131, 0.3);
    }

    .items-table th {
      background: #7C3F27;
      color: #FFF9F3;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 14px 18px;
      text-align: left;
    }

    .items-table td {
      padding: 16px 18px;
      font-size: 13px;
      border-bottom: 1px solid #FEEDDD;
      color: #411C10;
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
      font-size: 12px;
      color: #7C3F27;
      margin-top: 2px;
    }

    /* Breakdown & Totals */
    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 24px;
      gap: 30px;
    }

    .notes-box {
      flex: 1;
      background: #FFF9F3;
      padding: 16px 20px;
      border-radius: 14px;
      border: 1px dashed rgba(210, 156, 131, 0.5);
      font-size: 12px;
      line-height: 1.6;
      color: #6E4738;
    }

    .notes-box strong {
      color: #411C10;
      display: block;
      margin-bottom: 4px;
    }

    .totals-box {
      width: 320px;
      background: #FFF9F3;
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(210, 156, 131, 0.35);
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
      font-size: 16px;
      font-weight: 700;
      color: #411C10;
    }

    .total-row.grand-total .amount {
      color: #7C3F27;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
    }

    /* Footer */
    .invoice-footer {
      border-top: 2px solid #FEEDDD;
      margin-top: 40px;
      padding-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #7C3F27;
      line-height: 1.8;
    }

    .footer-highlight {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 15px;
      font-style: italic;
      color: #411C10;
      margin-bottom: 6px;
    }

    /* Print media styling */
    @media print {
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
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
        margin: 15mm 15mm 15mm 15mm;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Screen-only Print Bar -->
    <div class="print-bar">
      <div style="font-size: 13px; color: #411C10; font-weight: 600;">
        🧁 Official Pastry Paws Customer Invoice
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
          <p class="brand-tagline">Artisanal Bakery & Handcrafted Treats</p>
          <div class="studio-details">
            <p>Freshly baked from our studio kitchen</p>
            <p>WhatsApp & Phone: +91 97909 83844</p>
            <p>Email: pastrypaws012@gmail.com</p>
            <p>Website: pastrypaws.com</p>
          </div>
        </div>

        <div class="invoice-badge-box">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-meta">
            <p><strong>Invoice No:</strong> #${invoiceNo}</p>
            <p><strong>Order ID:</strong> #${order.orderId}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            ${orderTime ? `<p><strong>Time:</strong> ${orderTime}</p>` : ''}
            <span class="status-pill">${order.status ? order.status.replace(/_/g, ' ') : 'Registered'}</span>
          </div>
        </div>
      </header>

      <!-- Customer & Delivery Details -->
      <div class="billing-grid">
        <div>
          <span class="section-label">Billed To (Customer)</span>
          <p class="info-line"><strong>${order.customerName || 'Valued Guest'}</strong></p>
          <p class="info-line">Phone: ${order.customerPhone || 'N/A'}</p>
          <p class="info-line" style="margin-top: 6px;">
            Payment: <strong>${order.paymentMethod || 'Google Pay / UPI'}</strong>
          </p>
          ${order.transactionId ? `<p class="info-line">UPI Ref / UTR: <strong style="font-family: monospace; letter-spacing: 0.5px;">${order.transactionId}</strong></p>` : ''}
          ${order.paymentStatus ? `<p class="info-line">Payment Status: <strong style="color: ${order.paymentStatus === 'verified' ? '#2E7D32' : order.paymentStatus === 'rejected' ? '#C62828' : '#B78103'};">${order.paymentStatus.replace(/_/g, ' ').toUpperCase()}</strong></p>` : ''}
        </div>

        <div>
          <span class="section-label">Delivery Destination</span>
          <p class="info-line"><strong>Address:</strong> ${order.deliveryAddress || 'Standard Delivery'}</p>
          ${order.deliveryDate ? `<p class="info-line"><strong>Preferred Date:</strong> ${order.deliveryDate}</p>` : ''}
          ${order.deliveryTime ? `<p class="info-line"><strong>Preferred Slot:</strong> ${order.deliveryTime}</p>` : ''}
        </div>
      </div>

      <!-- Itemized Table Breakdown -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 50%;">Item & Particulars</th>
            <th style="width: 20%; text-align: center;">Portion / Size</th>
            <th style="width: 10%; text-align: center;">Qty</th>
            <th style="width: 20%; text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-title">${order.itemTitle}</div>
              <div class="item-subtitle">${order.category ? `Category: ${order.category} • ` : ''}100% Handcrafted Artisan Recipe</div>
            </td>
            <td style="text-align: center; font-weight: 600;">${order.selectedSize || 'Standard'}</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right; font-weight: 700; color: #7C3F27;">${formattedPrice}</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary & Notes -->
      <div class="summary-section">
        <div class="notes-box">
          <strong>Special Instructions / Notes:</strong>
          <p>${order.notes ? `"${order.notes}"` : 'No special customization requested. Prepared freshly as per standard studio recipe.'}</p>
          <p style="margin-top: 10px; font-size: 11px; color: #8C533C;">
            * Fresh bakes are crafted without artificial preservatives. Best enjoyed within 48 hours. Keep refrigerated if cream-based.
          </p>
        </div>

        <div class="totals-box">
          <div class="total-row">
            <span>Item Subtotal:</span>
            <span>${formattedPrice}</span>
          </div>
          <div class="total-row">
            <span>Artisan Packaging:</span>
            <span style="color: #2E7D32; font-weight: 600;">Complimentary</span>
          </div>
          <div class="total-row">
            <span>Studio Delivery:</span>
            <span style="color: #2E7D32; font-weight: 600;">Included</span>
          </div>
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span class="amount">${formattedPrice}</span>
          </div>
        </div>
      </div>

      <!-- Invoice Footer -->
      <footer class="invoice-footer">
        <p class="footer-highlight">"Baked with love, crafted for your special moments."</p>
        <p>Thank you for choosing Pastry Paws! For inquiries or event orders, reach us at +91 97909 83844.</p>
      </footer>
    </div>
  </div>

  <script>
    // Auto-trigger print dialog if opened in a dedicated window
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
 * Triggers the print / Save-as-PDF window for an order invoice.
 */
export function printOrderInvoice(order) {
  if (!order) return;
  const htmlContent = generateOrderInvoiceHtml(order);

  const printWindow = window.open('', '_blank', 'width=880,height=920,menubar=no,toolbar=no');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
