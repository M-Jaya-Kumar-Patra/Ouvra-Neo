# 💸 Ouvra-Neo  
### AI-Powered Personal Finance & Expense Split Tracking Platform

Ouvra-Neo is a modern, AI-driven personal finance platform designed to simplify expense tracking, help users manage split expenses with friends, and achieve financial goals efficiently.

Built with a scalable full-stack architecture, it delivers a secure, intuitive, and mobile-first experience.

---

## 🚀 Features

### 👥 Smart Split Tracking
- 📱 **UPI QR Scanning** – Capture payment details instantly by scanning merchant QR codes  
- 🧾 **OCR Bill Scanning** – Extract totals and items from receipts using Tesseract.js  
- ⚡ **Split Tracking System** – Track who owes whom with a clear “Your Share” breakdown  

---

### 🤖 AI-Driven Insights
- 🧠 **Auto Categorization** – Classifies expenses (Essentials, Leisure, Groceries) using AI  
- 📊 **Spending Analysis** – Detects patterns and provides smart alerts  

---

### 🎯 Goal-Based Savings
- 📈 **Progress Tracking** – Visual progress bars for savings goals  
- 💡 **Smart Recommendations** – Suggests daily/weekly savings targets  

---

### 📊 Dashboard & UI
- 📉 **Interactive Charts** – Monthly analytics with Recharts  
- 🌙 **Modern UI** – Dark-themed, mobile-first design using Tailwind CSS and Shadcn UI  

---

## 🛠️ Tech Stack

| Category        | Technology |
|----------------|-----------|
| Frontend       | React 19, Next.js 15 (App Router) |
| Styling        | Tailwind CSS 4, Shadcn UI |
| Backend        | Server Actions, Node.js |
| Database       | MongoDB Atlas (Mongoose) |
| Authentication | Auth.js v5 |
| AI/ML          | Tesseract.js, Groq API |
| Charts         | Recharts |

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/M-Jaya-Kumar-Patra/Ouvra-Neo.git
cd ouvra-neo
npm install
npm run dev


```


## 🔐 Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
MONGODB_URI=your_mongodb_connection
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GROQ_API_KEY=your_groq_api_key

```
---

## 📌 Key Highlights

- ⚡ Efficiently tracks group expense splits  
- 🧾 OCR reduces manual data entry  
- 🤖 AI-powered categorization & insights  
- 📱 Mobile-first smooth experience  
- 🔐 Secure authentication system  

---

## 🧠 Future Enhancements

- 💸 Direct payment integration (UPI settlement)  
- 📩 SMS-based expense detection  
- 🤖 AI financial assistant  
- 🔄 Debt simplification algorithm  

---

## 👨‍💻 Developer

**Jaya**  
Full-Stack Developer  
Focused on building personal finance solutions  
