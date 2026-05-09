"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
} from "recharts";

import toast, { Toaster } from "react-hot-toast";

import {
  Trash2,
  IndianRupee,
  Search,
  Pencil,
  Calendar,
  Download,
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

  const [category, setCategory] =
    useState("Food");

  const [income, setIncome] =
    useState(50000);

  const [budget, setBudget] =
    useState(20000);

  const [search, setSearch] =
    useState("");

  const [filterCategory, setFilterCategory] =
    useState("All");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchExpenses();

  }, []);

  const fetchExpenses = async () => {

    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("expenses")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (error) {

      toast.error("Failed to load expenses");

    } else {

      setExpenses(data || []);

    }

    setLoading(false);
  };

  const addExpense = async () => {

    if (!title || !amount) {

      toast.error("Fill all fields");

      return;
    }

    const expenseData = {
      title,
      amount: Number(amount),
      category,
      date: new Date().toLocaleDateString(),
    };

    if (editingId !== null) {

      const { error } = await supabase
        .from("expenses")
        .update(expenseData)
        .eq("id", editingId);

      if (error) {

        toast.error("Update failed");

      } else {

        toast.success("Expense updated");

      }

      setEditingId(null);

    } else {

      const { error } = await supabase
        .from("expenses")
        .insert([expenseData]);

      if (error) {

        toast.error("Insert failed");

      } else {

        toast.success("Expense added");

      }
    }

    setTitle("");
    setAmount("");
    setCategory("Food");

    fetchExpenses();
  };

  const deleteExpense = async (
    id: number
  ) => {

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {

      toast.error("Delete failed");

    } else {

      toast.success("Expense deleted");

      fetchExpenses();
    }
  };

  const editExpense = (
    expense: Expense
  ) => {

    setTitle(expense.title);

    setAmount(expense.amount.toString());

    setCategory(expense.category);

    setEditingId(expense.id || null);
  };

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + expense.amount,
    0
  );

  const savings =
    income - totalExpenses;

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
        matchesSearch &&
        matchesCategory
      );
    });

  }, [
    expenses,
    search,
    filterCategory,
  ]);

  const exportCSV = () => {

    const headers =
      "Title,Amount,Category,Date\n";

    const rows = expenses
      .map(
        (e) =>
          `${e.title},${e.amount},${e.category},${e.date}`
      )
      .join("\n");

    const csvContent =
      headers + rows;

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv",
      }
    );

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download = "expenses.csv";

    a.click();

    toast.success("CSV exported");
  };

  return (

    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white p-4 md:p-8">

      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">

          <div>

            <h1 className="text-4xl md:text-5xl font-black mb-2">
              Arya Spendzzz
            </h1>

            <p className="text-zinc-400">
              Smart Personal Finance Dashboard
            </p>

          </div>

          <div className="flex flex-col md:flex-row gap-4">

            <div>

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
                  className="bg-transparent outline-none text-xl font-bold w-[120px]"
                />

              </div>

            </div>

            <div>

              <label className="text-zinc-400 block mb-2">
                Monthly Budget
              </label>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-2xl">

                <IndianRupee size={18} />

                <input
                  type="number"
                  value={budget}
                  onChange={(e) =>
                    setBudget(
                      Number(e.target.value)
                    )
                  }
                  className="bg-transparent outline-none text-xl font-bold w-[120px]"
                />

              </div>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

          <Card
            title="Income"
            value={income}
            color="text-green-400"
          />

          <Card
            title="Expenses"
            value={totalExpenses}
            color="text-red-400"
          />

          <Card
            title="Savings"
            value={savings}
            color="text-blue-400"
          />

          <Card
            title="Highest Expense"
            value={highestExpense}
            color="text-yellow-400"
          />

        </div>

        <div className="mb-8">

          <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">

            <div
              className={`h-full ${
                totalExpenses > budget
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(
                  (totalExpenses / budget) *
                    100,
                  100
                )}%`,
              }}
            />

          </div>

          <p className="text-zinc-400 mt-2">

            Budget Used:
            {" "}
            ₹{totalExpenses}
            {" "}
            /
            {" "}
            ₹{budget}

          </p>

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

            <h2 className="text-2xl font-bold mb-6">
              Expense Breakdown
            </h2>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={categoryTotals}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#3b82f6"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <h2 className="text-2xl font-bold">
              Recent Expenses
            </h2>

            <div className="flex flex-col md:flex-row gap-3">

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

              <button
                onClick={exportCSV}
                className="bg-green-500 px-4 rounded-xl font-bold flex items-center gap-2"
              >

                <Download size={18} />

                Export

              </button>

            </div>

          </div>

          <div className="space-y-4 max-h-[500px] overflow-auto pr-2">

            {loading ? (

              <p className="text-zinc-400">
                Loading...
              </p>

            ) : filteredExpenses.length === 0 ? (

              <p className="text-zinc-500">
                No expenses found
              </p>

            ) : (

              filteredExpenses.map(
                (expense) => (

                  <div
                    key={expense.id}
                    className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-zinc-900/70 border border-zinc-800 p-4 rounded-2xl"
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
                            expense.id || 0
                          )
                        }
                        className="bg-red-500 p-2 rounded-lg hover:scale-110 transition"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </main>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {

  return (

    <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl">

      <h2 className="text-zinc-400 mb-3">
        {title}
      </h2>

      <p className={`text-4xl font-black ${color}`}>
        ₹{value}
      </p>

    </div>
  );
}