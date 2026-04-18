"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Define a proper interface instead of 'any'
interface MerchantPaymentProps {
  amount: number;
  merchantUpi: string;
  merchantName: string;
}

export function MerchantPaymentButton({ amount, merchantUpi, merchantName }: MerchantPaymentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePayment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    // Use encodeURIComponent for the name to handle spaces/special characters safely
    const upiUrl = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;

    if (isMobile) {
      window.location.href = upiUrl;
    } else {
      setShowDesktopModal(true);
    }
  };

  // Prevent hydration mismatch by returning a consistent placeholder until mounted
  if (!isMounted) {
    return (
      <div className="w-full py-3 bg-indigo-900/20 border border-indigo-500/10 rounded-xl text-center text-indigo-400 text-sm animate-pulse">
        Initializing Secure Payment...
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handlePayment}
        className="relative z-[10] w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-500/20"
      >
        <ShoppingBag size={18} />
        Pay {merchantName} ₹{amount}
      </button>

      {/* Desktop Fallback Modal */}
      {showDesktopModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full relative text-center shadow-2xl scale-in-center">
            <button 
              onClick={() => setShowDesktopModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-3xl shadow-inner">
                <QRCodeSVG 
                  value={`upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`} 
                  size={200}
                  level="H" // High error correction
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Smartphone size={20} className="text-indigo-400" />
              Scan to Pay
            </h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Scan this QR with <strong>GPay, PhonePe, or Paytm</strong> to complete your payment of <strong>₹{amount}</strong> to {merchantName}.
            </p>

            <button
              onClick={() => setShowDesktopModal(false)}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}