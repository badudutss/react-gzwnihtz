import React, { useState, useEffect } from 'react';
import { db, ref, onValue, push, set, remove } from './firebase';

export default function DriverWalletApp() {
  const [transactions, setTransactions] = useState([]);
  const [driver, setDriver] = useState('jonathan');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('credit');
  const [description, setDescription] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [editId, setEditId] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const transactionsRef = ref(db, 'transactions');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.keys(data).map((id) => ({ id, ...data[id] }));
        setTransactions(loaded.reverse());
      } else {
        setTransactions([]);
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-PH', { hour12: false });
      const dateString = now.toLocaleDateString('en-PH');
      setCurrentTime(`${dateString} ${timeString}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTransaction = () => {
    if (!amount || isNaN(amount)) return;
    const transactionData = {
      driver,
      type,
      description,
      bookingNumber,
      amount: parseFloat(amount),
      date:
        new Date().toLocaleDateString('en-CA') +
        ' ' +
        new Date().toLocaleTimeString(),
    };

    if (editId) {
      set(ref(db, `transactions/${editId}`), transactionData);
    } else {
      push(ref(db, 'transactions'), transactionData);
    }

    setAmount('');
    setDescription('');
    setBookingNumber('');
    setEditId(null);
    setDateFilter('');
    setDriverFilter('');
    setSaveMessage('✅ Data saved!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleEdit = (t) => {
    setDriver(t.driver);
    setType(t.type);
    setAmount(t.amount.toString());
    setDescription(t.description);
    setBookingNumber(t.bookingNumber);
    setEditId(t.id);
  };

  const handleDelete = (id) => {
    remove(ref(db, `transactions/${id}`));
  };

  const calculateTotal = (driver) => {
    return transactions
      .filter(
        (t) =>
          t.driver === driver && (!dateFilter || t.date.startsWith(dateFilter))
      )
      .reduce(
        (sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount),
        0
      );
  };

  const exportToExcel = () => {
    const headers = [
      'Driver',
      'Booking #',
      'Description',
      'Date',
      'Type',
      'Amount',
    ];
    const rows = transactions.map((t) => [
      t.driver === 'jonathan' ? 'Jonathan Besana' : 'Jun Alabado',
      t.bookingNumber,
      t.description,
      t.date,
      t.type,
      t.amount.toFixed(2),
    ]);
    const csv = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'wallet_transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Driver Wallet Tracker</h1>
          <div className="text-sm font-medium text-gray-500">{currentTime}</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-lg font-bold">Total Wallet</div>
          <div className="text-5xl font-extrabold text-green-600">
            ₱{(calculateTotal('jonathan') + calculateTotal('jun')).toFixed(2)}
          </div>
          <div className="text-sm text-gray-700">
            Jonathan: ₱{calculateTotal('jonathan').toFixed(2)}
            <br />
            Jun: ₱{calculateTotal('jun').toFixed(2)}
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className="text-green-600 text-sm font-medium">{saveMessage}</div>
      )}

      <div className="flex justify-between items-center gap-4">
        <input
          type="date"
          className="border px-2 py-1 rounded"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <select
          className="border px-2 py-1 rounded"
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
        >
          <option value="">All Drivers</option>
          <option value="jonathan">Jonathan Besana</option>
          <option value="jun">Jun Alabado</option>
        </select>
        <button
          onClick={exportToExcel}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Export to Excel
        </button>
      </div>

      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-6 gap-2 mb-2">
          <select
            className="border px-2 py-1 rounded"
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
          >
            <option value="jonathan">Jonathan Besana</option>
            <option value="jun">Jun Alabado</option>
          </select>
          <input
            type="text"
            placeholder="Booking Number"
            className="border px-2 py-1 rounded"
            value={bookingNumber}
            onChange={(e) => setBookingNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="border px-2 py-1 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="border px-2 py-1 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="border px-2 py-1 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <button
            onClick={addTransaction}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            {editId ? 'Update' : 'Add Transaction'}
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">All Transaction History</h2>
        <div className="overflow-x-auto whitespace-nowrap">
          <div className="inline-flex gap-4">
            {transactions
              .filter(
                (t) =>
                  (!dateFilter || t.date.startsWith(dateFilter)) &&
                  (!driverFilter || t.driver === driverFilter)
              )
              .map((t) => (
                <div
                  key={t.id}
                  className="min-w-[280px] border px-3 py-2 rounded bg-gray-50"
                >
                  <div className="font-bold">
                    {t.driver === 'jonathan' ? 'Jonathan' : 'Jun'}
                  </div>
                  <div className="text-xs text-gray-600">{t.date}</div>
                  <div className="text-sm">Booking: {t.bookingNumber}</div>
                  <div className="text-sm">{t.description}</div>
                  <div
                    className={
                      t.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {t.type === 'credit'
                      ? `+₱${t.amount.toFixed(2)}`
                      : `-₱${t.amount.toFixed(2)}`}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-blue-500 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
