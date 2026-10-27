import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ArrowRight,
  ArrowLeft,
  Banknote,
  QrCode,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { brandConfig } from '../data/brand';
import { getCachedPaymentConfig } from '../utils/paymentConfig';
import { WhatsAppIcon } from './Icons';
import { API_BASE_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export function CartCheckoutModal() {
  const {
    cartItems,
    cartSubtotal,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Details & Summary, 2: Payment Proof / COD, 3: Success Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('12:00 PM - 02:00 PM');
  const [notes, setNotes] = useState('');

  // Payment settings
  const [paymentConfig, setPaymentConfig] = useState(getCachedPaymentConfig());
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' or 'COD'
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Success state
  const [placedOrder, setPlacedOrder] = useState(null);

  // Fetch dynamic payment settings
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/payment-config`);
        if (res.ok) {
          const data = await res.json();
          if (data && isMounted) {
            setPaymentConfig(data);
          }
        }
      } catch {
        // Fallback to local default
      }
    }
    if (isCheckoutOpen) {
      loadConfig();
    }
    return () => {
      isMounted = false;
    };
  }, [isCheckoutOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(1);
      setError('');
      setPlacedOrder(null);
      setTransactionId('');
      setScreenshotFile(null);
      setScreenshotPreview('');
    }
  }, [isCheckoutOpen]);

  const activeVpa = paymentConfig.upiId || brandConfig.payment?.upiId || 'pastrypaws@oksbi';
  const activePayee = paymentConfig.payeeName || brandConfig.payment?.payeeName || 'Pastry Paws';
  const paymentWhatsapp = paymentConfig.whatsappNumber || brandConfig.contact?.whatsappNumber || '919790983844';

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(
    activePayee
  )}&am=${encodeURIComponent(cartSubtotal.toString())}&cu=INR&tn=${encodeURIComponent(
    `Order Pastry Paws (${cartItems.length} items)`
  )}`;

  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiDeepLink
  )}&bgcolor=FFF9F3&color=411C10&qzone=1`;

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(activeVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError('');
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setError('Please provide your name, phone number, and delivery address.');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmitOrder = async () => {
    setError('');

    const isCOD = paymentMethod === 'COD';

    if (!isCOD) {
      if (!screenshotFile && !screenshotPreview) {
        setError('Please upload a screenshot of your Google Pay / PhonePe payment.');
        return;
      }
      if (!transactionId.trim() || transactionId.trim().length < 6) {
        setError('Please enter a valid UPI Reference / UTR Number (at least 6 digits).');
        return;
      }
    }

    setLoading(true);

    try {
      let uploadedScreenshotUrl = '';
      let uploadedScreenshotPublicId = '';

      // Upload screenshot to Cloudinary if UPI payment
      if (!isCOD && screenshotFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', screenshotFile);

        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        setUploadingImage(false);

        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.message || 'Failed to upload payment screenshot. Please try again.');
        }

        uploadedScreenshotUrl = uploadData.url;
        uploadedScreenshotPublicId = uploadData.public_id || '';
      }

      // Format payload items
      const payloadItems = cartItems.map((item) => ({
        itemTitle: item.itemTitle,
        category: item.category,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        selectedAddons: item.selectedAddons || [],
        addonsTotal: (item.addonsUnitTotal || 0) * item.quantity,
        itemTotal: item.itemTotal,
        itemImage: item.itemImage,
      }));

      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryDate: deliveryDate || '',
        deliveryTime: deliveryTime || '',
        notes: notes ? notes.trim() : '',
        items: payloadItems,
        totalAmount: cartSubtotal,
        price: `₹${cartSubtotal}/-`,
        paymentMethod: isCOD ? 'Cash on Delivery' : 'Google Pay / UPI',
        paymentScreenshot: isCOD ? '' : uploadedScreenshotUrl,
        paymentScreenshotPublicId: isCOD ? '' : uploadedScreenshotPublicId,
        transactionId: isCOD ? 'COD' : transactionId.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit order. Please check your details.');
      }

      // Order created successfully!
      setPlacedOrder(data.data);
      clearCart();
      setStep(3);
    } catch (err) {
      console.error('Order submission error:', err);
      setError(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  // WhatsApp Message for Placed Order
  const generateWhatsAppMessage = () => {
    if (!placedOrder) return '';

    const isCOD = placedOrder.paymentMethod === 'Cash on Delivery';

    const itemsSummary = (placedOrder.items && placedOrder.items.length > 0)
      ? placedOrder.items
          .map((it, idx) => {
            const addonsStr =
              it.selectedAddons && it.selectedAddons.length > 0
                ? ` [Add-ons: ${it.selectedAddons.map((a) => a.name).join(', ')}]`
                : '';
            return `${idx + 1}. *${it.itemTitle}* (${it.selectedSize}) × ${it.quantity}${addonsStr} - ₹${it.itemTotal}/-`;
          })
          .join('\n')
      : `*Item:* ${placedOrder.itemTitle} (${placedOrder.selectedSize}) × ${placedOrder.quantity || 1}`;

    const text = isCOD
      ? `Hello Pastry Paws! I just placed an order with *Cash on Delivery*:\n\n*Order ID:* ${placedOrder.orderId}\n\n*Ordered Items:*\n${itemsSummary}\n\n*Total Bill:* ${placedOrder.price}\n*Customer:* ${placedOrder.customerName} (${placedOrder.customerPhone})\n*Address:* ${placedOrder.deliveryAddress}\n*Delivery Date:* ${placedOrder.deliveryDate} (${placedOrder.deliveryTime})\n*Payment Method:* Cash on Delivery\n\nPlease confirm my order. Thank you!`
      : `Hello Pastry Paws! I just placed an order with UPI payment proof:\n\n*Order ID:* ${placedOrder.orderId}\n\n*Ordered Items:*\n${itemsSummary}\n\n*Total Bill:* ${placedOrder.price}\n*Customer:* ${placedOrder.customerName} (${placedOrder.customerPhone})\n*Address:* ${placedOrder.deliveryAddress}\n*Delivery Date:* ${placedOrder.deliveryDate} (${placedOrder.deliveryTime})\n*UPI UTR / Ref No:* ${placedOrder.transactionId}\n*Payment Status:* Verification Pending\n\nPlease verify my payment and confirm. Thank you!`;

    return `https://wa.me/${paymentWhatsapp}?text=${encodeURIComponent(text)}`;
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#411C10]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[#FFF9F3] rounded-3xl shadow-2xl border border-[#D29C83]/30 overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#FEEDDD] border-b border-[#D29C83]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#7C3F27] text-[#FEEDDD] flex items-center justify-center shadow-2xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#411C10] leading-none">
                {step === 3 ? 'Order Confirmed!' : 'Checkout Sweet Cart'}
              </h2>
              <p className="text-[11px] text-[#A66D54] mt-0.5">
                {step === 1 && 'Step 1 of 2: Delivery & Contact Details'}
                {step === 2 && 'Step 2 of 2: Payment & Verification'}
                {step === 3 && `Order Reference: ${placedOrder?.orderId || ''}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCheckout}
            className="w-8 h-8 rounded-full bg-[#FFF9F3] hover:bg-[#FEE5D2] text-[#7C3F27] flex items-center justify-center border border-[#D29C83]/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Customer Details & Cart Item Review */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4 sm:space-y-5">
              {/* Cart Items Summary Box */}
              <div className="p-4 rounded-2xl bg-[#FEEDDD]/50 border border-[#D29C83]/30">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C3F27]">
                    Items in Cart ({cartItems.length})
                  </span>
                  <span className="text-xs font-bold text-[#411C10]">
                    Total: ₹{cartSubtotal}/-
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div
                      key={item.cartKey || idx}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-[#D29C83]/15 last:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="font-semibold text-[#411C10] truncate">
                          {item.itemTitle}
                        </span>
                        <span className="text-[10px] bg-[#FFF9F3] text-[#7C3F27] px-1.5 py-0.5 rounded border border-[#D29C83]/30 shrink-0">
                          {item.selectedSize} × {item.quantity}
                        </span>
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <span className="text-[10px] text-[#A66D54] truncate">
                            +{item.selectedAddons.length} add-on{item.selectedAddons.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-[#7C3F27] shrink-0">
                        ₹{item.itemTotal}/-
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Raman"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:ring-1 focus:ring-[#7C3F27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9790983844"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:ring-1 focus:ring-[#7C3F27]"
                    />
                  </div>
                </div>
              </div>

              {/* Address Input */}
              <div>
                <label className="block text-xs font-semibold text-[#411C10] mb-1">
                  Delivery / Pickup Address *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#A66D54] absolute left-3 top-3" />
                  <textarea
                    required
                    rows="2"
                    placeholder="Enter complete delivery address with door number, landmark & pincode (Avadi / Chennai)"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:ring-1 focus:ring-[#7C3F27]"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:ring-1 focus:ring-[#7C3F27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Preferred Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:ring-1 focus:ring-[#7C3F27]"
                    >
                      <option value="10:00 AM - 12:00 PM">Morning (10:00 AM - 12:00 PM)</option>
                      <option value="12:00 PM - 02:00 PM">Noon (12:00 PM - 02:00 PM)</option>
                      <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
                      <option value="05:00 PM - 08:00 PM">Evening (05:00 PM - 08:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#411C10] mb-1">
                  Cake Message / Custom Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Write 'Happy Birthday Karthik' on cake, eggless only"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:ring-1 focus:ring-[#7C3F27]"
                />
              </div>

              {/* Submit to Step 2 */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  <span>Continue to Payment (₹{cartSubtotal}/-)</span>
                  <ArrowRight className="w-4 h-4 text-[#F9C8B5]" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Method, QR Code, Verification */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === 'UPI'
                      ? 'bg-[#FEEDDD] border-[#7C3F27] shadow-xs'
                      : 'bg-[#FFF9F3] border-[#D29C83]/30 hover:bg-[#FEEDDD]/40'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#7C3F27]" />
                  <div>
                    <p className="text-xs font-bold text-[#411C10]">Google Pay / UPI</p>
                    <p className="text-[10px] text-[#A66D54]">Scan QR & Upload proof</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === 'COD'
                      ? 'bg-[#FEEDDD] border-[#7C3F27] shadow-xs'
                      : 'bg-[#FFF9F3] border-[#D29C83]/30 hover:bg-[#FEEDDD]/40'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#7C3F27]" />
                  <div>
                    <p className="text-xs font-bold text-[#411C10]">Cash on Delivery</p>
                    <p className="text-[10px] text-[#A66D54]">Pay upon pickup/delivery</p>
                  </div>
                </button>
              </div>

              {/* UPI Tab */}
              {paymentMethod === 'UPI' ? (
                <div className="space-y-4">
                  {/* QR Code and VPA Card */}
                  <div className="p-4 rounded-2xl bg-[#FEEDDD]/60 border border-[#D29C83]/35 flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-2 bg-[#FFF9F3] rounded-xl border border-[#D29C83]/40 shadow-xs shrink-0">
                      <img
                        src={dynamicQrCodeUrl}
                        alt="UPI Payment QR Code"
                        className="w-36 h-36 object-contain rounded-lg"
                      />
                      <p className="text-[9px] text-center font-bold text-[#7C3F27] mt-1">
                        Scan with GPay / PhonePe
                      </p>
                    </div>

                    <div className="flex-1 space-y-2 text-xs text-[#411C10] w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[#A66D54]">Total Amount:</span>
                        <span className="font-bold text-base text-[#7C3F27]">₹{cartSubtotal}/-</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#A66D54]">Payee Name:</span>
                        <span className="font-semibold">{activePayee}</span>
                      </div>
                      <div>
                        <span className="text-[#A66D54] block mb-1">UPI ID / VPA:</span>
                        <div className="flex items-center gap-1.5 bg-[#FFF9F3] p-1.5 px-2.5 rounded-xl border border-[#D29C83]/40">
                          <code className="text-xs font-mono font-bold text-[#7C3F27] flex-1 truncate">
                            {activeVpa}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyVpa}
                            className="p-1 hover:bg-[#FEEDDD] rounded-lg text-[#7C3F27] transition-colors cursor-pointer shrink-0"
                            title="Copy UPI ID"
                          >
                            {copiedVpa ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Direct UPI Intent Link for Mobile */}
                      <a
                        href={upiDeepLink}
                        className="inline-flex sm:hidden items-center justify-center gap-1.5 w-full py-2 bg-[#7C3F27] text-[#FEEDDD] rounded-xl text-xs font-semibold shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Tap to Pay on Mobile UPI App</span>
                      </a>
                    </div>
                  </div>

                  {/* Verification Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        UPI Reference / UTR Number (12 Digits) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 428901234567 or UPI Ref ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:ring-1 focus:ring-[#7C3F27]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        Upload Payment Screenshot *
                      </label>
                      <div className="border-2 border-dashed border-[#D29C83]/50 rounded-2xl p-4 bg-[#FEEDDD]/25 text-center relative hover:bg-[#FEEDDD]/40 transition-colors">
                        {screenshotPreview ? (
                          <div className="flex items-center justify-center gap-3">
                            <img
                              src={screenshotPreview}
                              alt="Screenshot Preview"
                              className="w-16 h-16 object-cover rounded-xl border border-[#D29C83]/40 shadow-xs"
                            />
                            <div className="text-left text-xs">
                              <p className="font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Screenshot Selected
                              </p>
                              <p className="text-[11px] text-[#A66D54]">
                                {screenshotFile?.name || 'receipt.png'}
                              </p>
                              <label
                                htmlFor="cart-screenshot-input"
                                className="text-[11px] text-[#7C3F27] font-semibold underline cursor-pointer mt-1 block"
                              >
                                Change image
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="cart-screenshot-input"
                            className="flex flex-col items-center justify-center cursor-pointer py-1"
                          >
                            <Upload className="w-6 h-6 text-[#A66D54] mb-1.5" />
                            <span className="text-xs font-semibold text-[#411C10]">
                              Click to upload payment screenshot
                            </span>
                            <span className="text-[10px] text-[#A66D54] mt-0.5">
                              PNG, JPG, or WEBP up to 10MB
                            </span>
                          </label>
                        )}
                        <input
                          id="cart-screenshot-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Cash on Delivery Notice */
                <div className="p-5 rounded-2xl bg-[#FEEDDD]/60 border border-[#D29C83]/40 text-xs text-[#411C10] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#7C3F27]">
                    <Banknote className="w-5 h-5" />
                    <span>Cash on Delivery Selected</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    You can pay the full bill of <strong className="text-[#7C3F27]">₹{cartSubtotal}/-</strong> in cash upon pickup or delivery. Our studio will prepare your items freshly.
                  </p>
                  <p className="text-[10px] text-[#A66D54] italic">
                    * Please keep exact change ready to ensure smooth handover.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-[#D29C83]/50 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>{uploadingImage ? 'Uploading Screenshot...' : 'Placing Order...'}</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#F9C8B5]" />
                      <span>Confirm & Place Order (₹{cartSubtotal}/-)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Placed Success Confirmation */}
          {step === 3 && placedOrder && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#A66D54]">
                  Order Placed Successfully
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#411C10] mt-1">
                  Order #{placedOrder.orderId}
                </h3>
                <p className="text-xs text-[#7C3F27] mt-1 max-w-sm mx-auto">
                  Thank you, <strong className="text-[#411C10]">{placedOrder.customerName}</strong>! We have received your order for {placedOrder.items?.length || 1} treat(s).
                </p>
              </div>

              {/* Order Breakdown Box */}
              <div className="p-4 rounded-2xl bg-[#FEEDDD]/70 border border-[#D29C83]/40 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between font-bold text-sm text-[#411C10] border-b border-[#D29C83]/30 pb-2">
                  <span>Total Amount Paid / Due:</span>
                  <span className="text-[#7C3F27]">{placedOrder.price}</span>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px] text-[#6E4738]">
                  <p><strong>Payment Method:</strong> {placedOrder.paymentMethod}</p>
                  <p><strong>Delivery / Pickup Date:</strong> {placedOrder.deliveryDate || 'Standard baking schedule'} ({placedOrder.deliveryTime})</p>
                  <p><strong>Address:</strong> {placedOrder.deliveryAddress}</p>
                </div>
              </div>

              {/* WhatsApp Notification Button */}
              <div className="pt-2 max-w-md mx-auto space-y-2">
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>Send Order Summary via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    closeCheckout();
                    navigate(`/track-order?phone=${encodeURIComponent(placedOrder.customerPhone)}`);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#7C3F27] hover:text-[#411C10] transition-colors cursor-pointer"
                >
                  <span>Track This Order Online →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
