import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Truck,
  Download,
  FileText,
} from 'lucide-react';
import { brandConfig } from '../data/brand';
import { API_BASE_URL } from '../utils/api';
import { printOrderInvoice } from '../utils/invoiceGenerator';

export function OrderModal({ isOpen, onClose, item, selectedTier }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: 'Afternoon (12 PM - 4 PM)',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!isOpen || !item) return null;

  const currentTier = selectedTier || (item.pricingDetails && item.pricingDetails[0]) || {
    size: 'Standard',
    price: `₹${item.startingPrice}/-`,
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload = {
      customerName: formData.name,
      customerPhone: formData.phone,
      deliveryAddress: formData.address,
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      notes: formData.notes,
      itemTitle: item.title,
      category: item.category,
      selectedSize: currentTier.size,
      price: currentTier.price,
      itemImage: item.image,
    };

    try {
      // Send to backend API
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPlacedOrder(data.data);
      } else {
        // Fallback local order ID if backend is offline
        setPlacedOrder({
          orderId: `PP-${Date.now().toString().slice(-6)}`,
          ...orderPayload,
        });
      }
    } catch {
      // Graceful offline fallback
      setPlacedOrder({
        orderId: `PP-${Date.now().toString().slice(-6)}`,
        ...orderPayload,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setPlacedOrder(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      deliveryDate: '',
      deliveryTime: 'Afternoon (12 PM - 4 PM)',
      notes: '',
    });
    onClose();
  };

  // Pre-filled WhatsApp link for order confirmation copy
  const whatsappReceiptUrl = placedOrder
    ? `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(
        `Hello Pastry Paws! I just placed an order on your website:\n\n*Order ID:* ${placedOrder.orderId}\n*Item:* ${placedOrder.itemTitle} (${placedOrder.selectedSize})\n*Price:* ${placedOrder.price}\n*Customer:* ${placedOrder.customerName} (${placedOrder.customerPhone})\n*Address:* ${placedOrder.deliveryAddress}\n\nPlease confirm my order. Thank you!`
      )}`
    : '#';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-[#2C1810]/75 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
          className="relative w-full max-w-lg bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D29C83]/20 bg-[#FEEDDD]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7C3F27] text-[#FEEDDD] flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-[#411C10] font-normal leading-tight">
                  {placedOrder ? 'Order Confirmed!' : 'Place Your Order'}
                </h3>
                <p className="text-[11px] text-[#7C3F27]">
                  {placedOrder ? 'Freshly baked upon confirmation' : 'Freshly baked to order with premium ingredients'}
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1.5 rounded-full text-[#7C3F27] hover:bg-[#FEE5D2] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
            {placedOrder ? (
              /* Success / Receipt Screen */
              <div className="space-y-5 text-center py-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>

                <div>
                  <span className="inline-block text-[11px] uppercase tracking-wider font-bold bg-[#FEEDDD] text-[#7C3F27] px-3 py-1 rounded-full border border-[#D29C83]/30">
                    Order ID: {placedOrder.orderId}
                  </span>
                  <h4 className="font-serif text-2xl text-[#411C10] mt-2 font-normal">
                    Thank You, {placedOrder.customerName}!
                  </h4>
                  <p className="text-xs text-[#7C3F27] mt-1">
                    Your order for <strong>{placedOrder.itemTitle}</strong> has been registered.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-[#FEEDDD]/40 rounded-2xl p-4 border border-[#D29C83]/25 text-left text-xs space-y-2">
                  <div className="flex justify-between pb-2 border-b border-[#D29C83]/20">
                    <span className="text-[#A66D54]">Item & Portion:</span>
                    <span className="font-semibold text-[#411C10]">{placedOrder.itemTitle} ({placedOrder.selectedSize})</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#D29C83]/20">
                    <span className="text-[#A66D54]">Total Amount:</span>
                    <span className="font-bold text-[#7C3F27] text-sm">{placedOrder.price}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#D29C83]/20">
                    <span className="text-[#A66D54]">Contact:</span>
                    <span className="text-[#411C10]">{placedOrder.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A66D54]">Delivery Address:</span>
                    <span className="text-[#411C10] max-w-[60%] text-right">{placedOrder.deliveryAddress}</span>
                  </div>
                </div>

                {/* UPI Coming Soon Notice */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-left flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>Payment Note:</strong> Direct UPI payment gateway is being connected. For now, you can pay via UPI or Cash upon delivery/pickup.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => printOrderInvoice(placedOrder)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#F9C8B5]" />
                      <span>Download Invoice (PDF)</span>
                    </button>
                    <button
                      onClick={handleResetAndClose}
                      className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl border border-[#D29C83]/40 text-[#411C10] hover:bg-[#FEEDDD] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <Link
                    to={`/track-order?phone=${encodeURIComponent(placedOrder.customerPhone || '')}`}
                    onClick={handleResetAndClose}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FEEDDD] text-[#7C3F27] hover:bg-[#FEE5D2] border border-[#D29C83]/30 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Live Status & Past Orders</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Order Form Screen */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selected Item Summary */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FEEDDD]/50 border border-[#D29C83]/30">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#D29C83]/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#7C3F27] tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="font-serif text-base text-[#411C10] font-normal truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FFF9F3] text-[#411C10] border border-[#D29C83]/30">
                        {currentTier.size}
                      </span>
                      <span className="text-sm font-bold text-[#7C3F27]">
                        {currentTier.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="name"
                        required
                        minLength={2}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Priya Sharma"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Phone Number (WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        pattern="[0-9]{10}"
                        minLength={10}
                        maxLength={10}
                        title="Please enter a valid 10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData((prev) => ({ ...prev, phone: val }));
                        }}
                        placeholder="10-digit mobile number (e.g. 9876543210)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Delivery Address / Location <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#A66D54] absolute left-3 top-2.5" />
                      <textarea
                        name="address"
                        required
                        minLength={5}
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House / Flat No., Street, Landmark, Area..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        Preferred Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          name="deliveryDate"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.deliveryDate}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        Preferred Time Slot <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          name="deliveryTime"
                          required
                          value={formData.deliveryTime}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                        >
                          <option>Morning (10 AM - 1 PM)</option>
                          <option>Afternoon (1 PM - 5 PM)</option>
                          <option>Evening (5 PM - 8 PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#411C10] mb-1">
                      Notes / Message on Cake (Optional)
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="e.g. 'Happy Birthday Alex', eggless, less sweet..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>
                </div>

                {/* Notice & Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-3 px-5 rounded-2xl text-sm font-medium tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#F9C8B5]" />
                    <span>
                      {isSubmitting ? 'Placing Order...' : `Confirm Order (${currentTier.price})`}
                    </span>
                  </button>
                  <p className="text-[10px] text-center text-[#A66D54] mt-2">
                    🔒 Instant confirmation. UPI online payment option will be active soon.
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
