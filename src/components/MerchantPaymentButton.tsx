"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function MerchantPaymentButton({ amount, merchantUpi, merchantName }: any) {
  const [isMounted, setIsMounted] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePayment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const upiUrl = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;

    if (isMobile) {
      window.location.href = upiUrl;
    } else {
      // Show the popup if on a laptop
      setShowDesktopModal(true);
    }
  };

  if (!isMounted) return <div className="w-full py-3 bg-indigo-900/50 rounded-xl text-center">Loading...</div>;

  return (
    <>
      <button
        type="button"
        onClick={handlePayment}
        className="relative z-[10] w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <ShoppingBag size={18} />
        Pay {merchantName} ₹{amount}
      </button>

      {/* Desktop Fallback Modal */}
      {showDesktopModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full relative text-center shadow-2xl">
            <button 
              onClick={() => setShowDesktopModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-2xl">
                <QRCodeSVG 
                  value={`upi://pay?pa=${merchantUpi}&pn=${merchantName}&am=${amount}&cu=INR`} 
                  size={180} 
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Smartphone size={20} className="text-indigo-400" />
              Open on Phone
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              UPI payments are only supported on mobile devices. Please scan this QR code with <strong>GPay, PhonePe, or Paytm</strong> to pay <strong>₹{amount}</strong>.
            </p>

            <button
              onClick={() => setShowDesktopModal(false)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}