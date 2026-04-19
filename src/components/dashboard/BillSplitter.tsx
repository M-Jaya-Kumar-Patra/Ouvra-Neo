"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, X, ReceiptText, IndianRupee, Loader2, Save, Camera, QrCode } from "lucide-react";
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
  const [friends, setFriends] = useState<Friend[]>([{ name: "", amount: "", upiId: "", userId: "" }]);
  const [isPending, startTransition] = useTransition();
  const [isScanning, setIsScanning] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [shopUpi, setShopUpi] = useState("");
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");

// Calculate numeric total and others' contribution
const totalNum = Number(total) || 0;
const friendsTotal = friends.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

// Your share is the remainder
const myAmount = (totalNum - friendsTotal).toFixed(2);

useEffect(() => {
  // Only auto-split if we have a total and NO amounts have been entered yet
  const hasTotal = totalNum > 0;
  const amountsAreEmpty = friends.every(f => f.amount === "" || f.amount === "0");

  if (hasTotal && amountsAreEmpty) {
    const totalPeople = friends.length + 1;
    const equalShare = (totalNum / totalPeople).toFixed(2);
    
    setFriends(prev => prev.map(f => ({ ...f, amount: equalShare })));
  }
}, [totalNum, friends.length]); // Re-runs when total changes or a friend is added/removed // Only re-run if total changes or people are added/removed
  // --- QR CAMERA LOGIC ---


  
  useEffect(() => {
  // 1. Explicitly type the variable here
  let html5QrCode: Html5Qrcode | null = null;

  if (isQRScannerOpen) {
    // 2. Assign the instance
    html5QrCode = new Html5Qrcode("qr-reader");
    
    const config = { 
      fps: 20, 
      qrbox: (w: number, h: number) => {
        const size = Math.floor(Math.min(w, h) * 0.8);
        return { width: size, height: size };
      }
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        if (decodedText.includes("upi://pay")) {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          setShopUpi(urlParams.get('pa') || "");
          const pn = urlParams.get('pn');
          if (pn) setShopName(decodeURIComponent(pn));
          
          // Use the variable here safely
          html5QrCode?.stop().then(() => setIsQRScannerOpen(false));
        }
      },
      () => {} 
    ).catch((err) => console.error("Scanner start failed", err));
  }

  // 3. The Cleanup Function
  return () => {
    // Check if it exists AND if it is currently scanning before stopping
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode.stop().catch(e => console.error("Cleanup failed", e));
    }
  };
}, [isQRScannerOpen]);

  // --- INVOICE IMAGE SCANNER ---
  const handleScanInvoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);

    try {
      // Create a local URL for the image
      const imageUrl = URL.createObjectURL(file);

      // OCR PROCESSING (English)
      const worker = await Tesseract.createWorker('eng');
      const { data: { text } } = await worker.recognize(imageUrl);
      
      if (text && text.trim().length > 10) {
        const data = await extractInvoiceData(text);
        if (data.total) setTotal(data.total.toString());
        if (data.description) setDescription(data.description);
        
        if (data.friends && data.friends.length > 0) {
          setFriends(data.friends.map((f: any) => ({
            name: f.name,
            amount: f.amount.toString(),
            upiId: "",
            userId: ""
          })));
        }
      } else {
        alert("Could not read text clearly. Please take a steadier photo.");
      }

      await worker.terminate();
      URL.revokeObjectURL(imageUrl); // Clean up memory
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Something went wrong while scanning the image.");
    } finally {
      setIsScanning(false);
    }
  };

  // --- ACTIONS ---
  const addFriend = () => setFriends([...friends, { name: "", amount: "", upiId: "", userId: "" }]);
  const removeFriend = (index: number) => setFriends(friends.filter((_, i) => i !== index));
  
  const splitEqual = () => {
    if (!total || Number(total) <= 0) return;
    const share = (Number(total) / (friends.length + 1)).toFixed(2);
    setFriends(friends.map(f => ({ ...f, amount: share })));
  };

  const handleSaveToDb = () => {
  if (!total || Number(total) <= 0) return alert("Please enter a total amount.");

  startTransition(async () => {
    try {
      const allParticipants = [
        { name: "You", amount: Number(myAmount), upiId: "", userId },
        ...friends.map(f => ({
          name: f.name,
          amount: Number(f.amount),
          upiId: f.upiId || "",
          userId: f.userId || ""
        }))
      ];

      const result = await createSplitRecord({
        userId,
        totalAmount: Number(total),
        description,
        merchantUpi: shopUpi,
        merchantName: shopName,
        participants: allParticipants
      });
      
      if (result?._id) window.location.href = `/manage-split/${result._id}`;
    } catch (error) {
      alert("Error saving record.");
    }
  });
};

  const handleQRFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Temporary instance to scan a static file
  const html5QrCode = new Html5Qrcode("qr-reader");

  try {
    const result = await html5QrCode.scanFileV2(file, true);
    const decodedText = result.decodedText;

    if (decodedText.includes("upi://pay")) {
      const urlParams = new URLSearchParams(decodedText.split('?')[1]);
      setShopUpi(urlParams.get('pa') || "");
      
      const pn = urlParams.get('pn');
      if (pn) setShopName(decodeURIComponent(pn));
      
      setIsQRScannerOpen(false); // Close modal on success
    } else {
      alert("No UPI information found in this image. Please use a valid payment QR.");
    }
  } catch (err) {
    console.error("QR File scan failed", err);
    alert("Could not read QR code. Please ensure the image is clear and well-lit.");
  }
};


const handleFriendAmountChange = (index: number, value: string) => {
  const newFriends = [...friends];
  newFriends[index].amount = value;
  setFriends(newFriends);
};

const handleAmountChange = (index: number, value: string) => {
  const newFriends = [...friends];
  newFriends[index].amount = value;
  setFriends(newFriends);
};

const totalAllocated = friends.reduce((acc, f) => acc + Number(f.amount || 0), 0);
const remaining = Number(total) - totalAllocated;


  return (
    <div className="p-4 md:p-8 rounded-[2rem] md:rounded-3xl bg-zinc-900 border border-zinc-800 backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <ReceiptText className="text-blue-500 h-5 w-5 md:h-6 md:w-6" />
          <h3 className="text-lg md:text-xl font-bold text-white">Smart Splitter</h3>
        </div>
        
        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-600/20 transition-all text-[10px] md:text-xs font-bold shrink-0">
          {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          {isScanning ? "Reading..." : "Scan Bill"}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleScanInvoice} 
            className="hidden" 
          />
        </label>
      </div>

      {/* Main Inputs */}
      <div className="space-y-4">
        <div className="relative">
          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
          <input 
            type="number"
            placeholder="Total Bill Amount"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none text-base md:text-lg font-medium"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>

        <input 
          placeholder="What was this for?"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Merchant Section */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Merchant Info</span>
            <button 
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1 text-[9px] md:text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 active:scale-95 transition-transform"
            >
              <QrCode size={12} /> SCAN QR
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input 
              placeholder="Shop Name"
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
            <input 
              placeholder="Shop UPI ID"
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none"
              value={shopUpi}
              onChange={(e) => setShopUpi(e.target.value)}
            />
          </div>
        </div>

        {/* Friends Section */}
        <div className="space-y-3">
          {/* YOUR DYNAMIC SHARE */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2.5 text-xs md:text-sm text-blue-400 font-bold">
              Your Share
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-500/50">₹</span>
              <input 
                value={myAmount} 
                readOnly 
                className="w-24 md:w-28 bg-blue-500/5 border border-blue-500/20 rounded-xl pl-6 pr-4 py-2.5 text-xs md:text-sm text-blue-400 font-mono font-bold outline-none"
              />
            </div>
            <div className="w-8 shrink-0" /> 
          </div>

          {/* EDITABLE FRIENDS */}
          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {friends.map((friend, idx) => (
              <div key={idx} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1">
                <input 
                  placeholder="Name"
                  value={friend.name}
                  onChange={(e) => {
                    const next = [...friends];
                    next[idx].name = e.target.value;
                    setFriends(next);
                  }}
                  className="flex-1 min-w-0 bg-zinc-800/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs md:text-sm text-white outline-none focus:border-blue-500"
                />
                <div className="relative shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">₹</span>
                  <input 
                    type="number"
                    placeholder="0"
                    value={friend.amount}
                    onChange={(e) => handleFriendAmountChange(idx, e.target.value)}
                    className="w-20 md:w-28 bg-zinc-800/50 border border-zinc-800 rounded-xl pl-6 pr-2 md:pr-4 py-2.5 text-xs md:text-sm text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
                <button onClick={() => removeFriend(idx)} className="p-2 text-zinc-600 hover:text-rose-500 transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining Balance Indicator */}
        {total && Math.abs(remaining) > 0.01 && (
          <div className={`text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full w-fit mx-auto ${remaining > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {remaining > 0 
              ? `₹${remaining.toFixed(2)} left to allocate` 
              : `Over allocated by ₹${Math.abs(remaining).toFixed(2)}`}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2">
          <button onClick={addFriend} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] md:text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Plus className="h-3 w-3" /> Add Person
          </button>
          <button onClick={splitEqual} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] md:text-xs font-bold rounded-xl transition-colors">
            Split Equally
          </button>
        </div>

        <button 
          onClick={handleSaveToDb}
          disabled={isPending}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isPending ? "Saving..." : "Confirm Split"}
        </button>
      </div>

      {/* QR MODAL - Fully Responsive Overlay */}
      {isQRScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative">
            <button 
              onClick={() => setIsQRScannerOpen(false)}
              className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold text-sm"
            >
              <X size={20} /> Close
            </button>

            <h3 className="text-white text-center font-bold mb-4">Scan Merchant QR</h3>
            <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-indigo-500 bg-black aspect-square w-full"></div>
            
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 w-full">
                <div className="h-px bg-zinc-800 flex-1" />
                <span className="text-zinc-600 text-[10px] font-bold">OR</span>
                <div className="h-px bg-zinc-800 flex-1" />
              </div>

              <label className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-zinc-700 active:scale-95">
                <Camera size={16} />
                Gallery QR
                <input type="file" accept="image/*" className="hidden" onChange={handleQRFileScan} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}