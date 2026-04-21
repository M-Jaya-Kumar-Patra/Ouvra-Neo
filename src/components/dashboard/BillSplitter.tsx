"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Plus, X, ReceiptText, IndianRupee, Loader2, Save, Camera, QrCode, CreditCard, ImageIcon } from "lucide-react";
import { createSplitRecord, extractInvoiceData } from "@/lib/actions/split.actions";
import Tesseract from 'tesseract.js';
import { Html5Qrcode } from "html5-qrcode";

interface Friend {
  name: string;
  amount: string;
  upiId: string;
  userId: string;
}

export function BillSplitter({ userId }: { userId: string }) {
  const [total, setTotal] = useState("");
  // CHANGED: Initialize with empty array to show only "Your Share" initially
  const [friends, setFriends] = useState<Friend[]>([]); 
  const [isPending, startTransition] = useTransition();
  const [isScanning, setIsScanning] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [shopUpi, setShopUpi] = useState("");
  const [shopName, setShopName] = useState("Merchant");
  const [description, setDescription] = useState("");
  
  // Use a ref to track the scanner instance for reliable cleanup
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  const totalNum = Number(total) || 0;
  const friendsTotal = friends.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const myAmount = (totalNum - friendsTotal).toFixed(2);

  // Auto-split logic
  useEffect(() => {
    const hasTotal = totalNum > 0;
    const amountsAreEmpty = friends.every(f => f.amount === "" || f.amount === "0");

    if (hasTotal && amountsAreEmpty && friends.length > 0) {
      const totalPeople = friends.length + 1;
      const equalShare = (totalNum / totalPeople).toFixed(2);
      setFriends(prev => prev.map(f => ({ ...f, amount: equalShare })));
    }
  }, [totalNum, friends.length]);

  const handleQRSuccess = (decodedText: string) => {
  if (decodedText.includes("upi://pay")) {
    const urlParams = new URLSearchParams(decodedText.split('?')[1]);
    setShopUpi(urlParams.get('pa') || "");
    const pn = urlParams.get('pn');
    // Using your default logic: if pn exists use it, otherwise keep "Merchant"
    if (pn) setShopName(decodeURIComponent(pn));
    
    stopScanner();
  } else {
    alert("No valid UPI data found.");
  }
};

  // --- IMPROVED QR CAMERA LOGIC WITH CLEANUP ---
  // Update your useEffect to include a small timeout or check
useEffect(() => {
  if (isQRScannerOpen) {
    // Small delay to ensure the modal's "qr-reader" div is rendered in the DOM
    const setupScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        qrScannerRef.current = html5QrCode;

        const config = {
          fps: 20,
          qrbox: (w: number, h: number) => {
            const size = Math.floor(Math.min(w, h) * 0.8);
            return { width: size, height: size };
          }
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => handleQRSuccess(decodedText), // Use the helper
          () => {}
        );
      } catch (err) {
        console.error("Scanner start failed", err);
      }
    };

    const timer = setTimeout(setupScanner, 100); // Give React 100ms to mount the modal
    return () => clearTimeout(timer);
  } else {
    stopScanner();
  }
}, [isQRScannerOpen]);
  const stopScanner = async () => {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current = null;
      } catch (e) {
        console.error("Failed to stop scanner", e);
      }
    }
    setIsQRScannerOpen(false);
  };

  // --- ACTIONS ---
  const handleScanInvoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      const worker = await Tesseract.createWorker('eng');
      const { data: { text } } = await worker.recognize(imageUrl);
      
      if (text && text.trim().length > 10) {
        const data = await extractInvoiceData(text);
        if (data.total) setTotal(data.total.toString());
        if (data.description) setDescription(data.description);
        if (data.friends?.length > 0) {
          setFriends(data.friends.map((f: any) => ({
            name: f.name,
            amount: f.amount.toString(),
            upiId: "",
            userId: ""
          })));
        }
      }
      await worker.terminate();
      URL.revokeObjectURL(imageUrl);
    } finally {
      setIsScanning(false);
    }
  };

  const addFriend = () => setFriends([...friends, { name: "", amount: "", upiId: "", userId: "" }]);
  const removeFriend = (index: number) => setFriends(friends.filter((_, i) => i !== index));
  const splitEqual = () => {
    if (totalNum <= 0) return;
    const share = (totalNum / (friends.length + 1)).toFixed(2);
    setFriends(friends.map(f => ({ ...f, amount: share })));
  };

  // --- DYNAMIC BUTTON LOGIC ---
  const hasBasics = totalNum > 0 && description.trim().length > 0;

// 2. Check if UPI is valid
const isPaymentReady = shopUpi && shopUpi.includes("@");

// 3. The button should be active if we have basics. 
// It doesn't matter if friends.length is 0 (that just means you're paying the whole thing).
const isFormInvalid = !hasBasics;
  

// 1. Add a helper to check for mobile
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const handleAction = () => {
  if (isFormInvalid) return;

  startTransition(async () => {
    try {
      const allParticipants = [
        { name: "You", amount: Number(myAmount), upiId: "", userId },
        ...friends.map(f => ({
          name: f.name || "Friend",
          amount: Number(f.amount),
          upiId: f.upiId || "",
          userId: f.userId || ""
        }))
      ];

      const result = await createSplitRecord({
        userId,
        totalAmount: totalNum,
        description,
        merchantUpi: shopUpi,
        merchantName: shopName,
        participants: allParticipants
      });

      if (result?._id) {
        // SCENARIO A: Payment Info exists AND user is on Mobile
        if (isPaymentReady && isMobile()) {
          // Force the amount to 2 decimal places (e.g., 500 becomes 500.00)
const formattedTotal = Number(total).toFixed(2);

const upiUrl = `upi://pay?pa=${shopUpi}&pn=${encodeURIComponent(shopName || "Merchant")}&am=${formattedTotal}&cu=INR&tn=${encodeURIComponent(description)}`;
          // Launch the payment app
          window.location.href = upiUrl;

          // Crucial: Wait for the app to open before navigating the background page
          // If we don't wait, the browser kills the upi:// request
          setTimeout(() => {
            window.location.href = `/manage-split/${result._id}`;
          }, 1000);
        } 
        // SCENARIO B: No payment info OR user is on PC
        else {
          // Just go to the management page (where you can show a QR on PC)
          window.location.href = `/manage-split/${result._id}`;
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error saving record.");
    }
  });
};




const handleQRFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Use the existing scanner instance or create a temp one
  const scanner = qrScannerRef.current || new Html5Qrcode("qr-reader");
  try {
    const result = await scanner.scanFileV2(file, true);
    handleQRSuccess(result.decodedText);
  } catch (err) {
    alert("Could not read QR from gallery. Please use a clearer image.");
  }
};


  const remaining = totalNum - friendsTotal;

  return (
    <div className="p-4 md:p-8 rounded-[2rem] md:rounded-3xl bg-zinc-900 border border-zinc-800 backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <ReceiptText className="text-blue-500 h-5 w-5 md:h-6 md:w-6" />
          <h3 className="text-lg md:text-xl font-bold text-white">Smart Splitter</h3>
        </div>
        
        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-600/20 transition-all text-[10px] md:text-xs font-bold shrink-0">
          {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          {isScanning ? "Reading..." : "Scan Bill"}
          <input type="file" accept="image/*" capture="environment" onChange={handleScanInvoice} className="hidden" />
        </label>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
          <input 
            type="number"
            placeholder="Total Bill Amount"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-blue-500 outline-none text-base font-medium"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>

        <input 
          placeholder="What was this for? (e.g. Dinner, Rent)"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Merchant Payment (Optional)</span>
            <button 
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 active:scale-95"
            >
              <QrCode size={12} /> SCAN QR
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input placeholder="Shop Name" className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            <input placeholder="Shop UPI ID" className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none" value={shopUpi} onChange={(e) => setShopUpi(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2.5 text-xs text-blue-400 font-bold">Your Share</div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-500/50">₹</span>
              <input value={myAmount} readOnly className="w-24 md:w-28 bg-blue-500/5 border border-blue-500/20 rounded-xl pl-6 pr-4 py-2.5 text-xs text-blue-400 font-mono font-bold outline-none" />
            </div>
            <div className="w-8" />
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {friends.map((friend, idx) => (
              <div key={idx} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                <input 
                  placeholder="Friend's Name" 
                  value={friend.name} 
                  onChange={(e) => {
                    const next = [...friends];
                    next[idx].name = e.target.value;
                    setFriends(next);
                  }}
                  className="flex-1 min-w-0 bg-zinc-800/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
                <div className="relative shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">₹</span>
                  <input 
                    type="number" 
                    value={friend.amount} 
                    onChange={(e) => {
                      const next = [...friends];
                      next[idx].amount = e.target.value;
                      setFriends(next);
                    }}
                    className="w-20 md:w-28 bg-zinc-800/50 border border-zinc-800 rounded-xl pl-6 py-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
                <button onClick={() => removeFriend(idx)} className="p-2 text-zinc-600 hover:text-rose-500 transition-colors"><X size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {total && Math.abs(remaining) > 0.01 && (
          <div className={`text-[10px] font-bold px-3 py-1 rounded-full mx-auto w-fit ${remaining > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {remaining > 0 ? `₹${remaining.toFixed(2)} left to allocate` : `Over by ₹${Math.abs(remaining).toFixed(2)}`}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={addFriend} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"><Plus className="h-3 w-3" /> Add Friend</button>
          <button onClick={splitEqual} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl">Split Equally</button>
        </div>

        <button 
          onClick={handleAction}
          disabled={isPending || isFormInvalid}
          className={`w-full py-4 font-bold rounded-2xl active:scale-[0.98] disabled:opacity-30 mt-4 shadow-lg flex items-center justify-center gap-2 transition-all ${
            isPaymentReady ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white" : "bg-blue-600 text-white"
          }`}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : isPaymentReady ? <CreditCard className="h-5 w-5" /> : <Save className="h-5 w-5" />}
          {isPending ? "Processing..." : isPaymentReady ? `Split & Pay ₹${total}` : "Confirm Split"}
        </button>
      </div>

      {isQRScannerOpen && (
  <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative">
      <button onClick={stopScanner} className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold text-sm">
        <X size={20} /> Close
      </button>
      
      {/* Live Camera View */}
      <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-indigo-500 bg-black aspect-square w-full"></div>
      
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-[1px] bg-zinc-800 flex-1" />
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Or</span>
          <div className="h-[1px] bg-zinc-800 flex-1" />
        </div>

        {/* Gallery Upload Button */}
        <label className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-zinc-700 active:scale-95">
          <ImageIcon size={16} /> {/* or use Camera icon */}
          Gallery QR
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleQRFileScan} 
          />
        </label>
      </div>
    </div>
  </div>
)}
    </div>
  );
}