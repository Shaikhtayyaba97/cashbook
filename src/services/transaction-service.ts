
import type { Transaction } from "@/lib/types";

// This is a mock service that uses localStorage to simulate a database.
// In a real application, you would replace these calls with a real database like Firebase Firestore.

const getStorageKey = (phone: string) => `transactions-${phone}`;

// Fetches all transactions for a given user
export const getTransactions = async (phone: string): Promise<Transaction[]> => {
  try {
    const savedTransactions = window.localStorage.getItem(getStorageKey(phone));
    if (savedTransactions) {
      // Parse and ensure dates are Date objects
      return JSON.parse(savedTransactions).map((tx: any) => ({
        ...tx,
        date: new Date(tx.date),
      })).sort((a: Transaction, b: Transaction) => b.date.getTime() - a.date.getTime());
    }
    return [];
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return [];
  }
};

// Saves all transactions for a given user
const saveTransactions = async (phone: string, transactions: Transaction[]): Promise<void> => {
  try {
    window.localStorage.setItem(getStorageKey(phone), JSON.stringify(transactions));
    // Dispatch a storage event to notify other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: getStorageKey(phone),
      newValue: JSON.stringify(transactions)
    }));
  } catch (error) {
    console.error("Failed to save transactions:", error);
  }
};

// Adds a new transaction
export const addTransaction = async (phone: string, newTransactionData: Omit<Transaction, "id" | "date">): Promise<Transaction> => {
  const transactions = await getTransactions(phone);
  const newTransaction: Transaction = {
    ...newTransactionData,
    id: new Date().toISOString() + Math.random(), // more unique id
    date: new Date(),
  };
  const updatedTransactions = [newTransaction, ...transactions];
  await saveTransactions(phone, updatedTransactions);
  return newTransaction;
};

// Updates an existing transaction
export const updateTransaction = async (phone: string, updatedTransaction: Transaction): Promise<Transaction | null> => {
  const transactions = await getTransactions(phone);
  const index = transactions.findIndex(tx => tx.id === updatedTransaction.id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updatedTransaction };
    await saveTransactions(phone, transactions);
    return transactions[index];
  }
  return null;
};

// Deletes a transaction
export const deleteTransaction = async (phone: string, transactionId: string): Promise<void> => {
  let transactions = await getTransactions(phone);
  transactions = transactions.filter(tx => tx.id !== transactionId);
  await saveTransactions(phone, transactions);
};
