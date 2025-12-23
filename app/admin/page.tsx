"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  subject?: string;
};

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState<Partial<Question>>({
    question: "",
    options: ["", "", "", ""],
    answerIndex: 0,
    subject: "General",
  });

  async function loadQuestions() {
    setLoading(true);
    const res = await fetch("/api/questions");
    const data = (await res.json()) as Question[];
    setQuestions(data);
    setLoading(false);
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  function handleChangeOption(index: number, value: string) {
    setForm((prev) => {
      const options = prev.options ? [...prev.options] : ["", "", "", ""];
      options[index] = value;
      return { ...prev, options };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;

    await fetch("/api/questions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setForm({
      question: "",
      options: ["", "", "", ""],
      answerIndex: 0,
      subject: "General",
    });
    setEditing(null);
    await loadQuestions();
  }

  async function handleDelete(id: string) {
    await fetch("/api/questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadQuestions();
  }

  function handleEdit(q: Question) {
    setEditing(q);
    setForm(q);
  }

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="mt-8 flex w-full max-w-5xl flex-col gap-8 px-6 pb-24 pt-16">
        <section className="rounded-3xl bg-white px-8 py-8 shadow-sm dark:bg-zinc-950">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Admin Panel - Questions
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Yahan se aap quiz ke saare questions add / edit / delete kar sakte
            hain. Education page inhi questions ko use karega.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white px-6 py-6 shadow-sm dark:bg-zinc-950"
          >
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              {editing ? "Question Edit karein" : "Naya Question add karein"}
            </h2>

            <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Question
              <textarea
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                rows={3}
                value={form.question || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, question: e.target.value }))
                }
                required
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Subject
              <input
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                value={form.subject || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, subject: e.target.value }))
                }
              />
            </label>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Options
              </p>
              {new Array(4).fill(null).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    className="h-4 w-4"
                    checked={form.answerIndex === index}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, answerIndex: index }))
                    }
                  />
                  <input
                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    placeholder={`Option ${index + 1}`}
                    value={form.options?.[index] || ""}
                    onChange={(e) => handleChangeOption(index, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-white"
            >
              {editing ? "Update Question" : "Add Question"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({
                    question: "",
                    options: ["", "", "", ""],
                    answerIndex: 0,
                    subject: "General",
                  });
                }}
                className="mt-3 ml-3 inline-flex items-center justify-center rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
            )}
          </form>

          <section className="rounded-3xl bg-white px-6 py-6 shadow-sm dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Questions List
            </h2>
            {loading ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Loading...
              </p>
            ) : questions.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Abhi koi question nahi hai. Pehle ek question add karein.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {questions.map((q) => (
                  <li
                    key={q.id}
                    className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-black dark:text-zinc-50">
                          {q.question}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          Subject: {q.subject || "General"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(q)}
                          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}


