import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
} from "firebase/database";

// 🔑 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCil-Qi2IYPzdkWSTvJRj2LdEwTVtXxHao",
  authDomain: "wallet-driver-1fa85.firebaseapp.com",
  databaseURL:
    "https://wallet-driver-1fa85-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wallet-driver-1fa85",
  storageBucket: "wallet-driver-1fa85.firebasestorage.app",
  messagingSenderId: "767103242077",
  appId: "1:767103242077:web:52b80303b803e0abd222b4",
  measurementId: "G-FDHT14K0EC",
};

// 🔥 Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function DriverWalletApp() {
  const [transactions, setTransactions] = useState([]);
  const [filterDriver, setFilterDriver] = useState("All Drivers");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: null,
    bookingNumber: "",
    description: "",
    amount: "",
    type: "Debit",
    driver: "jun",
  });

  // 📥 Fetch transactions in real time
  useEffect(() => {
    const transactionsRef = ref(db, "transactions");
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formatted = Object.entries(data).map(([id, value]) => ({
          id,
          driver: value.driver || "Unknown",
          bookingNumber: value.bookingNumber || "",
          description: value.description || "",
          amount: value.amount || 0,
          type: value.type?.toLowerCase() === "credit" ? "Credit" : "Debit",
          createdAt: value.date ? new Date(value.date) : new Date(),
        }));

        // ✅ Newest first
        const sorted = formatted.sort((a, b) => b.createdAt - a.createdAt);
        setTransactions(sorted);
      } else {
        setTransactions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 📊 Wallet balances
  const totalJun = transactions
    .filter((t) => t.driver.toLowerCase() === "jun")
    .reduce((sum, t) => sum + (t.type === "Credit" ? t.amount : -t.amount), 0);

  const totalJonathan = transactions
    .filter((t) => t.driver.toLowerCase() === "jonathan")
    .reduce((sum, t) => sum + (t.type === "Credit" ? t.amount : -t.amount), 0);

  const totalWallet = totalJun + totalJonathan;

  // 🔍 Filtered list
  const filteredTransactions =
    filterDriver === "All Drivers"
      ? transactions
      : transactions.filter(
          (t) => t.driver.toLowerCase() === filterDriver.toLowerCase()
        );

  // ➕ Add or ✏️ Edit transaction
  const handleSubmit = (e) => {
    e.preventDefault();
    const transactionData = {
      bookingNumber: form.bookingNumber,
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type.toLowerCase(),
      driver: form.driver,
      date: new Date().toLocaleString(),
    };

    if (form.id) {
      // Update
      update(ref(db, `transactions/${form.id}`), transactionData);
    } else {
      // Add new
      push(ref(db, "transactions"), transactionData);
    }

    setForm({
      id: null,
      bookingNumber: "",
      description: "",
      amount: "",
      type: "Debit",
      driver: "jun",
    });
  };

  // 🗑 Delete transaction
  const handleDelete = (id) => {
    remove(ref(db, `transactions/${id}`));
  };

  // ✏️ Edit transaction
  const handleEdit = (t) => {
    setForm({
      id: t.id,
      bookingNumber: t.bookingNumber,
      description: t.description,
      amount: t.amount,
      type: t.type,
      driver: t.driver,
    });
  };

  // 📤 Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      transactions.map((t) => ({
        Date: t.createdAt ? t.createdAt.toLocaleString() : "-",
        Driver: t.driver,
        BookingNumber: t.bookingNumber,
        Description: t.description,
        Debit: t.type === "Debit" ? t.amount : "",
        Credit: t.type === "Credit" ? t.amount : "",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  };

  return (
    <div style={{ padding: "10px", fontFamily: "Arial" }}>
      <h2>Driver Wallet Tracker</h2>
      <p>{new Date().toLocaleString()}</p>
      <p>Total Wallet: ₱{totalWallet.toFixed(2)}</p>
      <p>Jun: ₱{totalJun.toFixed(2)}</p>
      <p>Jonathan: ₱{totalJonathan.toFixed(2)}</p>

      {/* 🚦 Controls */}
      <div style={{ marginBottom: "10px" }}>
        <select
          value={filterDriver}
          onChange={(e) => setFilterDriver(e.target.value)}
        >
          <option>All Drivers</option>
          <option>Jun</option>
          <option>Jonathan</option>
        </select>
        <button onClick={exportToExcel} style={{ marginLeft: "10px" }}>
          Export to Excel
        </button>
      </div>

      {/* 📝 Add/Edit Transaction */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Booking #"
          value={form.bookingNumber}
          onChange={(e) => setForm({ ...form, bookingNumber: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option>Debit</option>
          <option>Credit</option>
        </select>
        <select
          value={form.driver}
          onChange={(e) => setForm({ ...form, driver: e.target.value })}
        >
          <option>jun</option>
          <option>jonathan</option>
        </select>
        <button type="submit">
          {form.id ? "Update Transaction" : "Add Transaction"}
        </button>
      </form>

      {/* 📜 Transaction History */}
      <h3>All Transaction History</h3>
      {loading ? (
        <p>Loading transaction history...</p>
      ) : (
        <table
          border="1"
          cellPadding="5"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th>Date</th>
              <th>Driver</th>
              <th>Booking #</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id}>
                <td>{t.createdAt ? t.createdAt.toLocaleString() : "-"}</td>
                <td>{t.driver}</td>
                <td>{t.bookingNumber}</td>
                <td>{t.description}</td>
                <td style={{ textAlign: "right" }}>
                  {t.type === "Debit" ? `₱${t.amount.toFixed(2)}` : ""}
                </td>
                <td style={{ textAlign: "right" }}>
                  {t.type === "Credit" ? `₱${t.amount.toFixed(2)}` : ""}
                </td>
                <td>
                  <button onClick={() => handleEdit(t)}>Edit</button>
                  <button onClick={() => handleDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
