"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X, Smartphone, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface MerchantPaymentProps {
  amount: number;
  merchantUpi: string;
  merchantName: string;
  merchantCode?: string; // Added this
}

export function MerchantPaymentButton({ amount, merchantUpi, merchantName, merchantCode }: MerchantPaymentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePayment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const formattedAmount = Number(amount).toFixed(2);
    const transactionId = `TXN${Date.now()}`;
    const encodedName = encodeURIComponent(merchantName);
    
    // Base UPI parameters
    let upiQuery = `pa=${merchantUpi}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tr=${transactionId}`;
    if (merchantCode) upiQuery += `&mc=${merchantCode}`;

    const upiUrl = `upi://pay?${upiQuery}`;

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      // Android Intent: Forces the app selector and is more reliable than window.location
      window.location.href = `intent://pay?${upiQuery}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
    } else if (isIOS) {
      // iOS: Standard deep link works better here, but requires user gesture
      window.location.href = upiUrl;
    } else {
      setShowDesktopModal(true);
    }
  };

  if (!isMounted) return <div className="w-full py-3 bg-zinc-900 rounded-xl animate-pulse" />;

  return (
    <>
      <button
        type="button"
        onClick={handlePayment}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
      >
        <ShoppingBag size={18} />
        Pay {merchantName} ₹{amount}
      </button>

      {showDesktopModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] max-w-sm w-full relative text-center">
            <button onClick={() => setShowDesktopModal(false)} className="absolute top-6 right-6 text-zinc-500">
              <X size={24} />
            </button>

            <div className="bg-white p-4 rounded-3xl inline-block mb-6">
              <QRCodeSVG 
                value={`upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR${merchantCode ? `&mc=${merchantCode}` : ''}`} 
                size={200} 
                level="H" 
              />
            </div>

            <h3 className="text-xl font-bold mb-2">Scan to Pay</h3>
            <p className="text-zinc-400 text-sm mb-6">Open GPay, PhonePe, or Paytm to pay ₹{amount}</p>
            
            <button onClick={() => setShowDesktopModal(false)} className="w-full py-3 bg-zinc-800 rounded-xl">
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}