"use client";

import { useState, useTransition, useEffect } from "react"; // Added useEffect
import { Plus, X, ReceiptText, IndianRupee, Loader2, Save, Camera, QrCode } from "lucide-react"; // Added QrCode
import { createSplitRecord, extractInvoiceData } from "@/lib/actions/split.actions";
import Tesseract from 'tesseract.js';
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode"; // Install this: npm install html5-qrcode

interface Friend {
  name: string;
  amount: string;
  upiId: string;
  userId: string;
}

export function BillSplitter({ userId }: { userId: string }) {
  const [total, setTotal] = useState("");
  const [friends, setFriends] = useState<Friend[]>([
    { name: "", amount: "", upiId: "", userId: "" }
  ]);
  const [isPending, startTransition] = useTransition();
  const [isScanning, setIsScanning] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false); // For camera modal
  
  const [shopUpi, setShopUpi] = useState("");
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");

  // --- QR CAMERA LOGIC ---
  useEffect(() => {
  if (isQRScannerOpen) {
    // 1. Initialize the logic-only class (no built-in UI)
    const html5QrCode = new Html5Qrcode("qr-reader");

    const config = { 
  fps: 20, // Increase FPS for faster detection
  qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
      // Make the scanning box 80% of the smaller dimension
      const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
      const fontSize = Math.floor(minEdge * 0.8);
      return { width: fontSize, height: fontSize };
  },
  aspectRatio: 1.777778 // Standard 16:9 laptop camera ratio
};
    // 2. Start the camera
    html5QrCode.start(
      { facingMode: "environment" }, // Use back camera
      config,
      (decodedText) => {
        // SUCCESS: Handle UPI
        if (decodedText.includes("upi://pay")) {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          setShopUpi(urlParams.get('pa') || "");
          const pn = urlParams.get('pn');
          if (pn) setShopName(decodeURIComponent(pn));
          
          // Stop and close
          html5QrCode.stop().then(() => setIsQRScannerOpen(false));
        }
      },
      () => {
        // FAILURE: This runs every frame a QR isn't found.
        // By leaving this empty, we SILENTLY ignore the error you saw.
      }
    ).catch((err) => {
      console.error("Unable to start scanning", err);
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(e => console.error("Cleanup failed", e));
      }
    };
  }
}, [isQRScannerOpen]);
  // --- EXISTING LOGIC ---
  const addFriend = () => setFriends([...friends, { name: "", amount: "", upiId: "", userId: "" }]);
  const removeFriend = (index: number) => setFriends(friends.filter((_, i) => i !== index));
  
  const splitEqual = () => {
    if (!total || Number(total) <= 0) return;
    const share = (Number(total) / (friends.length + 1)).toFixed(2);
    setFriends(friends.map(f => ({ ...f, amount: share })));
  };

  const handleSaveToDb = () => {
    if (!total || Number(total) <= 0) {
      alert("Please enter a valid total amount.");
      return;
    }
    startTransition(async () => {
      try {
        const calculatedShare = Number((Number(total) / (friends.length + 1)).toFixed(2));
        const friendsWithShares = friends.map(f => ({
          name: f.name,
          amount: calculatedShare,
          upiId: f.upiId || "",
          userId: f.userId || ""
        }));

        const result = await createSplitRecord({
          userId: userId,
          totalAmount: Number(total),
          description: description || "General Expense",
          merchantUpi: shopUpi,
          merchantName: shopName,
          participants: friendsWithShares
        });
        
        if (result?._id) {
          window.location.href = `/manage-split/${result._id}`;
        }
      } catch (error) {
        alert("Something went wrong while saving.");
      }
    });
  };

  const handleScanInvoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setIsScanning(true);

  try {
    // Initialize worker with logger to see progress in console
    const worker = await Tesseract.createWorker('eng');
    
    // Set parameters to improve accuracy for invoices
    await worker.setParameters({
      tessedit_pageseg_mode: '3' as any, // Auto segmentation
    });

    const { data: { text } } = await worker.recognize(file);
    console.log("Raw OCR Text:", text); // Check your console to see what it "sees"

    if (!text || text.trim().length < 10) {
      alert("OCR failed to read text. Please ensure the image is clear and well-lit.");
      return;
    }

    const data = await extractInvoiceData(text);

// 1. Set Total
if (data.total) setTotal(data.total.toString());

// 2. NEW: Set the Description/Notes
if (data.description) {
  setDescription(data.description);
} else if (data.items && data.items.length > 0) {
  // Fallback if the AI gives a list instead of a summary string
  setDescription(`Purchase: ${data.items.join(", ")}`);
}

// 3. Optional: Auto-fill friends if found
if (data.friends && data.friends.length > 0) {
  setFriends(data.friends.map((f: any) => ({
    name: f.name,
    amount: f.amount.toString(),
    upiId: "",
    userId: ""
  })));
}


    await worker.terminate();
  } catch (error) {
    console.error("OCR Error:", error);
  } finally {
    setIsScanning(false);
  }
};
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Create a temporary instance to scan the file
  const html5QrCode = new Html5Qrcode("qr-reader");

  try {
    const result = await html5QrCode.scanFileV2(file, true);
    const decodedText = result.decodedText;

    if (decodedText.includes("upi://pay")) {
      const urlParams = new URLSearchParams(decodedText.split('?')[1]);
      setShopUpi(urlParams.get('pa') || "");
      
      const pn = urlParams.get('pn');
      if (pn) setShopName(decodeURIComponent(pn));
      
      setIsQRScannerOpen(false);
    } else {
      alert("No UPI information found in this image.");
    }
  } catch (err) {
    console.error("File scan failed", err);
    alert("Could not read QR code. Please try a clearer image.");
  }
};

  return (
    <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 backdrop-blur-md relative">
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ReceiptText className="text-blue-500 h-6 w-6" />
          <h3 className="text-xl font-bold text-white">Smart Bill Splitter</h3>
        </div>
        
        {/* Invoice Scan Button */}
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-600/20 transition-all text-xs font-bold">
          {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {isScanning ? "Reading..." : "Scan Invoice"}
          <input type="file" accept="image/*" onChange={handleScanInvoice} className="hidden" />
        </label>
      </div>

      {/* 2. Inputs Section */}
      <div className="space-y-4">
        <div className="relative">
          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
          <input 
            type="number"
            placeholder="Total Bill Amount"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 transition-all outline-none"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>

        <input 
          placeholder="What was this for? (e.g. Dinner)"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* 3. Shop Detail & QR Scanner */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Merchant Info</span>
            
            {/* NEW: Camera QR Scan Button */}
            <button 
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 transition-all"
            >
              <QrCode size={12} /> SCAN SHOP QR
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <input 
              placeholder="Shop Name"
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-indigo-500"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
            <input 
              placeholder="Shop UPI ID"
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-indigo-500"
              value={shopUpi}
              onChange={(e) => setShopUpi(e.target.value)}
            />
          </div>
        </div>

        {/* 4. Friends List and Actions */}
        <div className="space-y-3">
          {friends.map((friend, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                placeholder="Name"
                value={friend.name}
                onChange={(e) => {
                  const newFriends = [...friends];
                  newFriends[idx].name = e.target.value;
                  setFriends(newFriends);
                }}
                className="flex-1 bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
              />
              <input 
                placeholder="₹0"
                value={friend.amount}
                readOnly
                className="w-24 bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-blue-400 font-mono outline-none"
              />
              <button onClick={() => removeFriend(idx)} className="text-zinc-500 hover:text-rose-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={addFriend} className="flex-1 py-3 bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2">
            <Plus className="h-3 w-3" /> Add Person
          </button>
          <button onClick={splitEqual} className="flex-1 py-3 bg-zinc-700 text-white text-xs font-bold rounded-xl">
            Calculate Shares
          </button>
        </div>

        <button 
          onClick={handleSaveToDb}
          disabled={isPending}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-lg shadow-blue-600/20"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isPending ? "Saving..." : "Confirm Split"}
        </button>
      </div>

      {/* --- CAMERA OVERLAY MODAL --- */}
      {isQRScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative">
            <button 
              onClick={() => setIsQRScannerOpen(false)}
              className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold"
            >
              <X size={24} /> Close
            </button>
           

            <h3 className="text-white text-center font-bold mb-4">Scan Merchant UPI QR</h3>
            <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-indigo-500"></div>
            <p className="text-zinc-500 text-[10px] text-center mt-4">Point your camera at a GPay, PhonePe, or BharatPe QR code</p>

            <div className="mt-4 flex flex-col items-center gap-3">
  <div className="w-full h-px bg-zinc-800" />
  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Or</p>
  
  <label className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-zinc-700">
    <Camera size={16} />
    Upload QR from Gallery
    <input 
      type="file" 
      accept="image/*" 
      className="hidden" 
      onChange={handleFileScan} 
    />
  </label>
</div>


          </div>

          
        </div>
      )}
    </div>
  );
}