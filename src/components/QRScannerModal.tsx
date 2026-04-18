"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, X } from "lucide-react";

export function QRScannerModal({ onScanSuccess }: { onScanSuccess: (upiId: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        // UPI QR codes look like: upi://pay?pa=id@bank...
        // We need to extract the 'pa' (Address) part
        if (decodedText.includes("upi://pay")) {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          const upiId = urlParams.get('pa');
          
          if (upiId) {
            onScanSuccess(upiId);
            setIsOpen(false);
            scanner.clear();
          }
        }
      }, (error) => {
        // Silent error for scanning frames
      });

      return () => scanner.clear();
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all"
      >
        <QrCode size={18} />
        Scan Shop QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-4 overflow-hidden relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 text-white bg-zinc-800 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-white text-center font-bold mb-4">Point at Merchant QR</h2>
            <div id="reader" className="overflow-hidden rounded-2xl"></div>
            <p className="text-zinc-500 text-xs text-center mt-4">
              Works with GPay, PhonePe, or BharatPe QR codes
            </p>
          </div>
        </div>
      )}
    </>
  );
}