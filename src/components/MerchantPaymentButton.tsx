  "use client";

  import { useEffect, useState } from "react";
  import { ShoppingBag, X, Smartphone } from "lucide-react";
  import { QRCodeSVG } from "qrcode.react";

  interface MerchantPaymentProps {
    amount: number;
    merchantUpi: string;
    merchantName: string;
    merchantCode?: string;
  }

  export function MerchantPaymentButton({ amount, merchantUpi, merchantName, merchantCode }: MerchantPaymentProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [showDesktopModal, setShowDesktopModal] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    

    const upiUrl =
  `upi://pay?pa=${encodeURIComponent(merchantUpi)}` +
  `&pn=${encodeURIComponent(merchantName)}` +
  `&am=${amount.toFixed(2)}` +
  `&cu=INR`;


    const handlePayment = (e: React.MouseEvent) => {
  e.preventDefault();

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!isMobile) {
    setShowDesktopModal(true);
    return;
  }

  const isAndroid = /Android/i.test(navigator.userAgent);
  const upiQuery = upiUrl.split("?")[1];

  if (isAndroid) {
    // 🔥 Step 1: Try direct UPI (best success rate)
    window.location.href = upiUrl;

    // 🔥 Step 2: Fallback → app chooser
    setTimeout(() => {
      window.location.href = `intent://pay?${upiQuery}#Intent;scheme=upi;end`;
    }, 1200);
  } else {
    // 🍏 iOS
    window.location.href = upiUrl;
  }
};

    if (!isMounted) return null;

    return (
      <>
        <button
          onClick={handlePayment}
          className="w-full px-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <ShoppingBag size={18} />
          Pay {merchantName} ₹{amount}
        </button>

        {showDesktopModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] max-w-sm w-full relative text-center">
              <button 
                onClick={() => setShowDesktopModal(false)} 
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>

              {/* QR CONTAINER: Forces a white background and padding for easy scanning */}
              <div className="bg-white p-6 rounded-3xl inline-block mb-6 shadow-2xl">
                {/* Force the SVG to render only when the modal is open */}
                <QRCodeSVG 
                  value={upiUrl} 
                  size={220} 
                  level="H" 
                  includeMargin={false}
                />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Scan to Pay</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Open <strong>GPay, PhonePe, or Paytm</strong> on your phone to complete payment.
              </p>

              <button
                onClick={() => setShowDesktopModal(false)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }