// lib/utils/payment.ts

interface Recipient {
  upiId: string;
  name: string;
}

export const generateUPILink = (amount: number, note: string, recipient: Recipient) => {
  // If the recipient doesn't have a UPI ID saved, we can't make a link
  if (!recipient.upiId) {
    return null; 
  }

  const params = new URLSearchParams({
    pa: recipient.upiId,
    pn: recipient.name,
    am: amount.toFixed(2),
    tn: note,
    cu: "INR",
  });

  return `upi://pay?${params.toString()}`;
};