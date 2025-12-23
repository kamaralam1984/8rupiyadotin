"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../Providers";

type Question = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  subject?: string;
};

export default function EducationPage() {
  const { language } = useAppContext();
  const isHindi = language === "hi";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subject, setSubject] = useState<string>("UPSC - History");
  const [questionLimit, setQuestionLimit] = useState<number>(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [skipLeft, setSkipLeft] = useState(3);
  const [hintUsed, setHintUsed] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [animateOption, setAnimateOption] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      params.set("limit", String(questionLimit));
      params.set("lang", language);

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = (await res.json()) as Question[];
      setQuestions(data);
      setLoading(false);
    }
    load();
  }, [questionLimit, subject, language]);

  useEffect(() => {
    if (finished || questions.length === 0) return;
    const id = window.setInterval(() => {
      setTimeSeconds((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [finished, questions.length]);

  function handleNext() {
    if (selected == null) return;

    const current = questions[currentIndex];
    setShowCorrect(true);
    setAnimateOption(selected);

    setTimeout(() => {
      if (selected === current.answerIndex) {
        setScore((s) => s + 4);
      } else {
        setScore((s) => s - 1);
      }

      setAnsweredCount((c) => c + 1);

      if (currentIndex === questions.length - 1) {
        setFinished(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setShowCorrect(false);
        setAnimateOption(null);
        setFiftyUsed(false);
        setHintUsed(false);
      }
    }, 1500);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setAnsweredCount(0);
    setFinished(false);
    setTimeSeconds(0);
    setFiftyUsed(false);
    setSkipLeft(3);
    setHintUsed(false);
    setShowCorrect(false);
    setAnimateOption(null);
  }

  function handleFiftyFifty() {
    if (fiftyUsed) return;
    setFiftyUsed(true);
  }

  function handleSkip() {
    if (skipLeft === 0) return;
    setSkipLeft((s) => s - 1);
    if (currentIndex === questions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setFiftyUsed(false);
      setHintUsed(false);
    }
  }

  function handleHint() {
    if (hintUsed) return;
    setHintUsed(true);
  }

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const currentQuestion = questions[currentIndex];

  const visibleOptions = currentQuestion
    ? currentQuestion.options.map((opt, idx) => {
        if (
          fiftyUsed &&
          idx !== currentQuestion.answerIndex &&
          idx !== currentQuestion.answerIndex + 1 &&
          idx % 2 === 0
        ) {
          return "";
        }
        return opt;
      })
    : [];

  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-zinc-900 dark:to-slate-800 font-sans">
      {/* Animated Background Elements with Golden Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-yellow-300/40 via-amber-300/40 to-orange-300/40 dark:from-yellow-600/20 dark:via-amber-600/20 dark:to-orange-600/20 blur-3xl animate-pulse golden-glow"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-rose-300/40 via-pink-300/40 to-red-300/40 dark:from-rose-600/20 dark:via-pink-600/20 dark:to-red-600/20 blur-3xl animate-pulse rainbow-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-200/30 via-amber-200/30 to-orange-200/30 dark:from-yellow-700/15 dark:via-amber-700/15 dark:to-orange-700/15 blur-3xl animate-pulse golden-glow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-purple-300/30 via-pink-300/30 to-rose-300/30 dark:from-purple-600/15 dark:via-pink-600/15 dark:to-rose-600/15 blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-300/30 via-blue-300/30 to-indigo-300/30 dark:from-cyan-600/15 dark:via-blue-600/15 dark:to-indigo-600/15 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <main className="relative z-10 mt-8 flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-16 mx-auto">
        {/* Header Card with Glassmorphism and Golden Glow */}
        <section className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-8 py-12 shadow-2xl ring-2 ring-yellow-200/50 dark:ring-yellow-600/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] dark:hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:ring-yellow-300/70 dark:hover:ring-yellow-500/50 golden-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-amber-400/10 via-orange-400/10 to-rose-400/10 dark:from-yellow-600/20 dark:via-amber-600/20 dark:via-orange-600/20 dark:to-rose-600/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10">
            <h1 className="bg-gradient-to-r from-yellow-600 via-amber-600 via-orange-600 to-rose-600 dark:from-yellow-400 dark:via-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-lg">
              {isHindi ? "Education Quiz" : "Education Quiz"}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              {isHindi
                ? "Ye UPSC-style practice quiz hai. Saare questions admin panel se control honge. Har sahi jawab par +4, galat par -1."
                : "This is a UPSC-style practice quiz. All questions are controlled from the admin panel. +4 for correct and -1 for wrong answers."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {isHindi ? "परीक्षा / विषय:" : "Exam / Subject:"}
                </span>
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setCurrentIndex(0);
                    setSelected(null);
                    setScore(0);
                    setAnsweredCount(0);
                    setFinished(false);
                    setTimeSeconds(0);
                  }}
                  className="h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-700/80 px-4 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none transition-all hover:border-yellow-400 dark:hover:border-yellow-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300/60"
                >
                  <option value="UPSC - History">UPSC - History</option>
                  <option value="UPSC - Polity">UPSC - Polity</option>
                  <option value="Class 10 - Maths">Class 10 - Maths</option>
                  <option value="Class 10 - Science">Class 10 - Science</option>
                  <option value="Class 9 - Maths">Class 9 - Maths</option>
                  <option value="Class 9 - Science">Class 9 - Science</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {isHindi ? "प्रश्नों की संख्या:" : "Number of questions:"}
                </span>
                <select
                  value={questionLimit}
                  onChange={(e) => {
                    setQuestionLimit(Number(e.target.value));
                    setCurrentIndex(0);
                    setSelected(null);
                    setScore(0);
                    setAnsweredCount(0);
                    setFinished(false);
                    setTimeSeconds(0);
                  }}
                  className="h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-700/80 px-4 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none transition-all hover:border-blue-300 dark:hover:border-yellow-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md focus:border-blue-500 dark:focus:border-yellow-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-yellow-500/50"
                >
                  {[10, 25, 50, 100].map((count) => (
                    <option key={count} value={count}>
                      {count} Questions
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 dark:from-yellow-600 dark:via-amber-600 dark:to-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-lg fire-glow">
                <span className="text-white/90">⏱️</span>
                <span>Time: {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Quiz Card with Golden Glow */}
        <section className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-8 py-10 shadow-2xl ring-2 ring-yellow-200/40 dark:ring-yellow-600/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,215,0,0.3)] dark:hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] hover:ring-yellow-300/60 dark:hover:ring-yellow-500/50 golden-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/8 via-amber-400/8 via-orange-400/8 to-rose-400/8 dark:from-yellow-600/15 dark:via-amber-600/15 dark:via-orange-600/15 dark:to-rose-600/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/10 dark:via-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 dark:border-yellow-600/30 border-t-blue-600 dark:border-t-yellow-500"></div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {isHindi ? "Questions load ho rahe hain..." : "Questions are loading..."}
                </p>
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-800/50 p-6 text-center ring-1 ring-blue-100 dark:ring-slate-600">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {isHindi
                    ? "Abhi koi question nahi mila. Pehle admin panel se questions add karein."
                    : "No questions found yet. Please add questions from the admin panel first."}
                </p>
              </div>
            ) : finished ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                  <span className="text-4xl">✓</span>
                </div>
                <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-3xl font-bold text-transparent">
                  {isHindi ? "Quiz Complete!" : "Quiz Complete!"}
                </h2>
                <div className="mx-auto max-w-md space-y-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-800/50 p-6 ring-1 ring-blue-100 dark:ring-slate-600">
                  <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                    {isHindi ? "Total questions attempted: " : "Total questions attempted: "}
                    <span className="font-bold text-blue-600 dark:text-yellow-400">{answeredCount}</span>
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Final Score: <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">{score}</span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isHindi ? "Time taken: " : "Time taken: "} {minutes}m {seconds}s
                  </p>
                </div>
                <button
                  onClick={handleRestart}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl fire-glow"
                >
                  <span className="relative z-10">
                    {isHindi ? "🔥 Quiz dobara start karein" : "🔥 Start quiz again"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 fire-flicker"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
          ) : (
            currentQuestion && (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span>
                      {isHindi ? "Question" : "Question"} {currentIndex + 1} / {questions.length}
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 dark:from-yellow-600 dark:via-amber-600 dark:to-orange-600 px-3 py-1 text-white shadow-md fire-glow">
                      Score: {score}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 shadow-inner">
                    <div 
                      className="h-full rounded-full multi-color-gradient transition-all duration-500 ease-out shadow-lg fire-glow"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question Card with Golden Glow */}
                <div className="rounded-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-700/50 dark:via-slate-800/50 dark:to-slate-700/50 p-6 ring-2 ring-yellow-200/50 dark:ring-yellow-600/30 transition-all duration-300 hover:shadow-lg hover:ring-yellow-300/70 dark:hover:ring-yellow-500/50 golden-glow">
                  <p className="text-lg font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.subject && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 dark:from-yellow-600 dark:to-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-md fire-glow">
                      <span>📚</span>
                      <span>{currentQuestion.subject}</span>
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {visibleOptions.map((opt, index) =>
                    opt ? (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !showCorrect && setSelected(index)}
                        className={`group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border-2 px-5 py-4 text-left text-sm font-medium transition-all duration-300 ${
                          selected === index
                            ? showCorrect && selected === currentQuestion.answerIndex
                              ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-lg ring-2 ring-green-200"
                              : showCorrect && selected !== currentQuestion.answerIndex
                              ? "border-red-500 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 shadow-lg ring-2 ring-red-200"
                              : "border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg ring-2 ring-blue-200"
                            : showCorrect && index === currentQuestion.answerIndex
                            ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-lg ring-2 ring-green-200"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-yellow-300 dark:hover:border-yellow-500 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-900/30 dark:hover:to-amber-900/30 hover:shadow-md hover:ring-1 hover:ring-yellow-200 dark:hover:ring-yellow-500/50"
                        } ${animateOption === index ? 'animate-pulse' : ''}`}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                            selected === index
                              ? showCorrect && selected === currentQuestion.answerIndex
                                ? "bg-green-500 text-white"
                                : showCorrect && selected !== currentQuestion.answerIndex
                                ? "bg-red-500 text-white"
                                : "bg-white text-blue-600"
                              : showCorrect && index === currentQuestion.answerIndex
                              ? "bg-green-500 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{opt}</span>
                        </span>
                        {selected === index && (
                          <span className="text-lg">✓</span>
                        )}
                        {showCorrect && index === currentQuestion.answerIndex && selected !== index && (
                          <span className="text-lg">✓</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      </button>
                    ) : null
                  )}
                </div>

                {/* Lifelines */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-800/50 p-4 ring-1 ring-slate-200 dark:ring-slate-600">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {isHindi ? "Lifelines:" : "Lifelines:"}
                    </span>
                    <button
                      type="button"
                      disabled={fiftyUsed}
                      onClick={handleFiftyFifty}
                      className="group relative overflow-hidden rounded-full border-2 border-orange-400 bg-gradient-to-r from-orange-200 to-amber-200 px-4 py-2 text-xs font-semibold text-orange-800 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 fire-glow"
                    >
                      <span className="relative z-10">🔥 50:50</span>
                      {fiftyUsed && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                    <button
                      type="button"
                      disabled={skipLeft === 0}
                      onClick={handleSkip}
                      className="group relative overflow-hidden rounded-full border-2 border-purple-400 bg-gradient-to-r from-purple-200 to-pink-200 px-4 py-2 text-xs font-semibold text-purple-800 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 rainbow-glow"
                    >
                      <span className="relative z-10">⏭️ Skip ({skipLeft})</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                    <button
                      type="button"
                      disabled={hintUsed}
                      onClick={handleHint}
                      className="group relative overflow-hidden rounded-full border-2 border-cyan-400 bg-gradient-to-r from-cyan-200 to-blue-200 px-4 py-2 text-xs font-semibold text-cyan-800 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 golden-glow"
                    >
                      <span className="relative z-10">💡 Hint</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </div>
                  {hintUsed && (
                    <div className="mt-2 rounded-lg bg-blue-100/80 dark:bg-blue-900/30 p-3 text-xs font-medium text-blue-800 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700">
                      💡 Hint: Correct option <span className="font-bold">{String.fromCharCode(65 + currentQuestion.answerIndex)}</span> ke aas-paas hai.
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-800/50 p-4 ring-1 ring-slate-200 dark:ring-slate-600">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {isHindi ? (
                      <>
                        <span className="font-bold text-green-600 dark:text-green-400">+4</span> sahi |
                        <span className="font-bold text-red-600 dark:text-red-400"> -1</span> galat
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-green-600 dark:text-green-400">+4</span> correct |
                        <span className="font-bold text-red-600 dark:text-red-400"> -1</span> wrong
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={selected == null || showCorrect}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 fire-glow"
                  >
                    <span className="relative z-10">
                      {currentIndex === questions.length - 1
                        ? isHindi ? "🔥 Finish Quiz" : "🔥 Finish Quiz"
                        : isHindi ? "➡️ Next Question" : "➡️ Next Question"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 fire-flicker"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            )
          )}
          </div>
        </section>
      </main>
    </div>
  );
}

