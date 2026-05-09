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
  Wallet,
  TrendingDown,
  PiggyBank,
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

type Expense = {
  id?: number;
  title: string;
  amount: number;
  category: string;
  date: string;
};

export default function Home() {

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const [income, setIncome] = useState(50000);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] =
    useState("All");

  const [editingIndex, setEditingIndex] =
    useState<number | null>(null);

  useEffect(() => {

    fetchExpenses();

    const savedIncome =
      localStorage.getItem("income");

    if (savedIncome) {
      setIncome(Number(savedIncome));
    }

  }, []);

  useEffect(() => {

    localStorage.setItem(
      "income",
      income.toString()
    );

  }, [income]);

  const fetchExpenses = async () => {

    const { data, error } =
      await supabase
        .from("expenses")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const formattedExpenses =
      data.map((expense: any) => ({
        ...expense,
        date: new Date(
          expense.created_at
        ).toLocaleDateString(),
      }));

    setExpenses(formattedExpenses);
  };

  const addExpense = async () => {

    if (!title || !amount) return;

    const expenseData = {
      title,
      amount: Number(amount),
      category,
    };

    if (editingIndex !== null) {

      const expenseToEdit =
        expenses[editingIndex];

      const { error } = await supabase
        .from("expenses")
        .update(expenseData)
        .eq("id", expenseToEdit.id);

      if (error) {
        console.error(error);
        return;
      }

      setEditingIndex(null);

    } else {

      const { error } = await supabase
        .from("expenses")
        .insert([expenseData]);

      if (error) {
        console.error(error);
        return;
      }
    }

    await fetchExpenses();

    setTitle("");
    setAmount("");
    setCategory("Food");
  };

  const deleteExpense = async (
    id?: number
  ) => {

    if (!id) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await fetchExpenses();
  };

  const editExpense = (index: number) => {

    const expense = expenses[index];

    setTitle(expense.title);

    setAmount(expense.amount.toString());

    setCategory(expense.category);

    setEditingIndex(index);
  };

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

  const categoryTotals: {
    name: string;
    value: number;
  }[] = expenses.reduce(
    (
      acc: {
        name: string;
        value: number;
      }[],
      expense
    ) => {

      const existing = acc.find(
        (
          item: {
            name: string;
            value: number;
          }
        ) =>
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
        matchesSearch &&
        matchesCategory
      );
    });

  }, [
    expenses,
    search,
    filterCategory,
  ]);

  return (

    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">

          <div>

            <h1 className="text-5xl font-black mb-2">
              Arya Spendzzz
            </h1>

            <p className="text-zinc-400 text-lg">
              Smart Personal Finance Dashboard
            </p>

          </div>

          <div className="mt-6 md:mt-0">

            <label className="text-zinc-400 block mb-2">
              Monthly Income
            </label>

            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-2xl">

              <IndianRupee size={18} />

              <input
                type="number"
                value={income}
                onChange={(e) =>
                  setIncome(
                    Number(e.target.value)
                  )
                }
                className="bg-transparent outline-none text-xl font-bold w-[150px]"
              />

            </div>

          </div>

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

            {editingIndex !== null
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

              {editingIndex !== null
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
                        entry: {
                          name: string;
                          value: number;
                        },
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
                          editExpense(index)
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