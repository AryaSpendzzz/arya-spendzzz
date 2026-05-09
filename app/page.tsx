"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Trash2,
  IndianRupee,
  Search,
  Pencil,
  Calendar,
} from "lucide-react";

const COLORS = [
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#14b8a6",
];

export default function Home() {

  const [user, setUser] = useState<any>(null);

  const [expenses, setExpenses] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const [income, setIncome] = useState(50000);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] =
    useState("All");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {

    checkUser();

  }, []);

  async function checkUser() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      fetchExpenses(user.id);
    }
  }

  async function signUp() {

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful");
    }
  }

  async function signIn() {

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
    } else {
      checkUser();
    }
  }

  async function signOut() {

    await supabase.auth.signOut();

    setUser(null);

    setExpenses([]);
  }

  async function fetchExpenses(userId: string) {

    const { data, error } =
      await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
  }

  async function addExpense() {

    if (!title || !amount) return;

    if (!user) return;

    if (editingId !== null) {

      await supabase
        .from("expenses")
        .update({
          title,
          amount: Number(amount),
          category,
        })
        .eq("id", editingId);

      setEditingId(null);

    } else {

      await supabase
        .from("expenses")
        .insert([
          {
            title,
            amount: Number(amount),
            category,
            date: new Date().toLocaleDateString(),
            user_id: user.id,
          },
        ]);
    }

    fetchExpenses(user.id);

    setTitle("");
    setAmount("");
    setCategory("Food");
  }

  async function deleteExpense(id: number) {

    await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    fetchExpenses(user.id);
  }

  function editExpense(expense: any) {

    setTitle(expense.title);

    setAmount(expense.amount.toString());

    setCategory(expense.category);

    setEditingId(expense.id);
  }

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + expense.amount,
    0
  );

  const savings = income - totalExpenses;

  const highestExpense =
    expenses.length > 0
      ? Math.max(
          ...expenses.map(
            (expense) => expense.amount
          )
        )
      : 0;

  const categoryTotals = expenses.reduce(
    (acc: any, expense) => {

      const existing = acc.find(
        (item: any) =>
          item.name === expense.category
      );

      if (existing) {
        existing.value += expense.amount;
      } else {
        acc.push({
          name: expense.category,
          value: expense.amount,
        });
      }

      return acc;

    },
    []
  );

  const filteredExpenses = useMemo(() => {

    return expenses.filter((expense) => {

      const matchesSearch =
        expense.title
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        filterCategory === "All"
          ? true
          : expense.category ===
            filterCategory;

      return (
        matchesSearch && matchesCategory
      );
    });

  }, [
    expenses,
    search,
    filterCategory,
  ]);

  if (!user) {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

        <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md border border-zinc-800">

          <h1 className="text-4xl font-black mb-8 text-center">
            Arya Spendzzz
          </h1>

          <div className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-zinc-800 p-4 rounded-xl outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-zinc-800 p-4 rounded-xl outline-none"
            />

            <button
              onClick={signIn}
              className="w-full bg-white text-black p-4 rounded-xl font-bold"
            >
              Login
            </button>

            <button
              onClick={signUp}
              className="w-full bg-green-500 p-4 rounded-xl font-bold"
            >
              Create Account
            </button>

          </div>

        </div>

      </main>
    );
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-5xl font-black mb-2">
              Arya Spendzzz
            </h1>

            <p className="text-zinc-400 text-lg">
              Smart Personal Finance Dashboard
            </p>

          </div>

          <button
            onClick={signOut}
            className="bg-red-500 px-5 py-3 rounded-xl font-bold"
          >
            Logout
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">

            <h2 className="text-zinc-400 mb-3">
              Income
            </h2>

            <p className="text-4xl font-black text-green-400">
              ₹{income}
            </p>

          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">

            <h2 className="text-zinc-400 mb-3">
              Expenses
            </h2>

            <p className="text-4xl font-black text-red-400">
              ₹{totalExpenses}
            </p>

          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">

            <h2 className="text-zinc-400 mb-3">
              Savings
            </h2>

            <p className="text-4xl font-black text-blue-400">
              ₹{savings}
            </p>

          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">

            <h2 className="text-zinc-400 mb-3">
              Highest Expense
            </h2>

            <p className="text-4xl font-black text-yellow-400">
              ₹{highestExpense}
            </p>

          </div>

        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl mb-10">

          <h2 className="text-2xl font-bold mb-6">

            {editingId !== null
              ? "Edit Expense"
              : "Add Expense"}

          </h2>

          <div className="grid md:grid-cols-4 gap-4">

            <input
              type="text"
              placeholder="Expense title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl outline-none"
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl outline-none"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl outline-none"
            >
              <option>Food</option>
              <option>Travel</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>Entertainment</option>
              <option>Health</option>
            </select>

            <button
              onClick={addExpense}
              className="bg-white text-black rounded-xl font-bold hover:scale-105 transition"
            >

              {editingId !== null
                ? "Update Expense"
                : "Add Expense"}

            </button>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">

            <h2 className="text-2xl font-bold mb-6">
              Expense Analytics
            </h2>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={categoryTotals}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >

                    {categoryTotals.map(
                      (
                        entry: any,
                        index: number
                      ) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

              <h2 className="text-2xl font-bold">
                Recent Expenses
              </h2>

              <div className="flex gap-3">

                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 rounded-xl">

                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    className="bg-transparent outline-none py-2"
                  />

                </div>

                <select
                  value={filterCategory}
                  onChange={(e) =>
                    setFilterCategory(
                      e.target.value
                    )
                  }
                  className="bg-zinc-900 border border-zinc-700 px-3 rounded-xl"
                >
                  <option>All</option>
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Shopping</option>
                  <option>Bills</option>
                  <option>Entertainment</option>
                  <option>Health</option>
                </select>

              </div>

            </div>

            <div className="space-y-4 max-h-[400px] overflow-auto pr-2">

              {filteredExpenses.map(
                (expense, index) => (

                  <div
                    key={index}
                    className="flex justify-between items-center bg-zinc-900/70 border border-zinc-800 p-4 rounded-2xl"
                  >

                    <div>

                      <p className="text-lg font-semibold">
                        {expense.title}
                      </p>

                      <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">

                        <span>
                          {expense.category}
                        </span>

                        <span className="flex items-center gap-1">

                          <Calendar size={14} />

                          {expense.date}

                        </span>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <p className="text-red-400 font-bold text-lg">
                        ₹{expense.amount}
                      </p>

                      <button
                        onClick={() =>
                          editExpense(expense)
                        }
                        className="bg-blue-500 p-2 rounded-lg hover:scale-110 transition"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          deleteExpense(
                            expense.id
                          )
                        }
                        className="bg-red-500 p-2 rounded-lg hover:scale-110 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}