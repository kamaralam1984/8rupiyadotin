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

type AnswerRecord = {
  questionId: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
  isCorrect: boolean;
  timeTaken: number;
};

export default function EducationPage() {
  const { language } = useAppContext();
  const isHindi = language === "hi";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subject, setSubject] = useState<string>("UPSC - History");
  const [questionLimit, setQuestionLimit] = useState<number>(10);
  const [questionTimeLimit, setQuestionTimeLimit] = useState<number>(30);
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
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(30);
  const [history, setHistory] = useState<AnswerRecord[]>([]);

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

  // Total quiz time (mm:ss)
  useEffect(() => {
    if (finished || questions.length === 0) return;
    const id = window.setInterval(() => {
      setTimeSeconds((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [finished, questions.length]);

  // Per-question countdown timer
  useEffect(() => {
    if (finished || questions.length === 0) return;
    if (questionTimeLeft <= 0) {
      // Time over -> treat as automatic skip (no marks)
      handleSkip();
      return;
    }
    const id = window.setTimeout(() => {
      setQuestionTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionTimeLeft, finished, questions.length]);

  // User clicked an option
  function handleOptionClick(index: number) {
    if (finished || questions.length === 0) return;
    const isLast = currentIndex === questions.length - 1;
    setSelected(index);

    // Record answer
    const current = questions[currentIndex];
    const isCorrect = index === current.answerIndex;

    setHistory((prev) => [
      ...prev,
      {
        questionId: current.id,
        question: current.question,
        options: current.options,
        correctIndex: current.answerIndex,
        selectedIndex: index,
        isCorrect,
        timeTaken: questionTimeLimit - questionTimeLeft,
      },
    ]);

    setScore((s) => s + (isCorrect ? 4 : -1));
    setAnsweredCount((c) => c + 1);

    if (isLast) {
      // Last question -> auto submit
      setFinished(true);
    } else {
      // Move to next question automatically
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setFiftyUsed(false);
      setHintUsed(false);
      setQuestionTimeLeft(questionTimeLimit);
    }
  }

  // Manual submit for last question (if user wants to submit without selecting)
  function handleSubmitQuiz() {
    if (finished || questions.length === 0) return;
    const current = questions[currentIndex];
    
    // If user selected an option, record it
    if (selected !== null) {
      const isCorrect = selected === current.answerIndex;
      setHistory((prev) => [
        ...prev,
        {
          questionId: current.id,
          question: current.question,
          options: current.options,
          correctIndex: current.answerIndex,
          selectedIndex: selected,
          isCorrect,
          timeTaken: questionTimeLimit - questionTimeLeft,
        },
      ]);
      setScore((s) => s + (isCorrect ? 4 : -1));
      setAnsweredCount((c) => c + 1);
    } else {
      // No answer selected -> record as skipped
      setHistory((prev) => [
        ...prev,
        {
          questionId: current.id,
          question: current.question,
          options: current.options,
          correctIndex: current.answerIndex,
          selectedIndex: null,
          isCorrect: false,
          timeTaken: questionTimeLimit - questionTimeLeft,
        },
      ]);
    }
    
    setFinished(true);
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
    setQuestionTimeLeft(questionTimeLimit);
    setHistory([]);
  }

  function handleFiftyFifty() {
    if (fiftyUsed) return;
    setFiftyUsed(true);
  }

  function handleSkip() {
    if (skipLeft === 0 || finished || questions.length === 0) return;
    const current = questions[currentIndex];

    setHistory((prev) => [
      ...prev,
      {
        questionId: current.id,
        question: current.question,
        options: current.options,
        correctIndex: current.answerIndex,
        selectedIndex: null,
        isCorrect: false,
        timeTaken: questionTimeLimit - questionTimeLeft,
      },
    ]);

    setSkipLeft((s) => s - 1);
    setAnsweredCount((c) => c + 1);

    if (currentIndex === questions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setFiftyUsed(false);
      setHintUsed(false);
      setQuestionTimeLeft(questionTimeLimit);
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
        if (fiftyUsed && idx !== currentQuestion.answerIndex && idx % 2 === 0) {
          return "";
        }
        return opt;
      })
    : [];

  const totalMinutes = Math.floor(timeSeconds / 60);
  const totalSecondsR = timeSeconds % 60;
  const qMinutes = Math.floor(questionTimeLeft / 60);
  const qSeconds = questionTimeLeft % 60;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-zinc-900 dark:to-slate-800 font-sans">
      {/* Animated Background Elements with Golden Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-yellow-300/30 via-amber-300/30 to-orange-300/30 dark:from-yellow-700/20 dark:via-amber-700/20 dark:to-orange-700/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-rose-300/30 via-pink-300/30 to-red-300/30 dark:from-rose-700/20 dark:via-pink-700/20 dark:to-red-700/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-200/20 via-amber-200/20 to-orange-200/20 dark:from-yellow-800/15 dark:via-amber-800/15 dark:to-orange-800/15 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-purple-300/25 via-pink-300/25 to-rose-300/25 dark:from-purple-700/20 dark:via-pink-700/20 dark:to-rose-700/20 blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-300/25 via-blue-300/25 to-indigo-300/25 dark:from-cyan-700/20 dark:via-blue-700/20 dark:to-indigo-700/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <main className="relative z-10 mt-8 flex w-full max-w-6xl flex-col gap-8 px-6 pb-24 pt-16 mx-auto">
        {/* Header Card with Glassmorphism and Golden Glow */}
        <section className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-8 py-12 shadow-xl ring-1 ring-yellow-100/60 dark:ring-yellow-600/30 transition-all duration-500 hover:shadow-2xl hover:ring-yellow-300/70 dark:hover:ring-yellow-500/50">
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
                    const val = e.target.value;
                    setSubject(val);
                    setCurrentIndex(0);
                    setSelected(null);
                    setScore(0);
                    setAnsweredCount(0);
                    setFinished(false);
                    setTimeSeconds(0);
                    setQuestionTimeLeft(questionTimeLimit);
                    setFiftyUsed(false);
                    setSkipLeft(3);
                    setHintUsed(false);
                    setHistory([]);
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
                    const val = Number(e.target.value);
                    setQuestionLimit(val);
                    setCurrentIndex(0);
                    setSelected(null);
                    setScore(0);
                    setAnsweredCount(0);
                    setFinished(false);
                    setTimeSeconds(0);
                    setQuestionTimeLimit(val);
                    setQuestionTimeLeft(val);
                    setFiftyUsed(false);
                    setSkipLeft(3);
                    setHintUsed(false);
                    setHistory([]);
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
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {isHindi ? "प्रश्न का समय:" : "Time per question:"}
                </span>
                <select
                  value={questionTimeLimit}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuestionTimeLimit(val);
                    setQuestionTimeLeft(val);
                  }}
                  className="h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-700/80 px-4 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none hover:border-yellow-400 dark:hover:border-yellow-500 hover:bg-white dark:hover:bg-slate-700"
                >
                  {[30, 45, 60].map((sec) => (
                    <option key={sec} value={sec}>
                      {sec} {isHindi ? "सेकंड" : "sec"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Main Quiz Card with Golden Glow */}
        <section className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-8 py-10 shadow-xl ring-1 ring-yellow-100/60 dark:ring-yellow-600/30 transition-all duration-500 hover:shadow-2xl hover:ring-yellow-300/60 dark:hover:ring-yellow-500/50">
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
              <div className="space-y-8 text-center">
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
                    {isHindi ? "Total time: " : "Total time: "} {totalMinutes}m {totalSecondsR}s
                  </p>
                </div>

                {history.length > 0 && (
                  <div className="mx-auto max-w-3xl space-y-4 text-left">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      {isHindi ? "प्रश्नों की समीक्षा" : "Question Review"}
                    </h3>
                    <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
                      {history.map((item, idx) => (
                        <div
                          key={`${item.questionId}-${idx}`}
                          className="rounded-2xl bg-white/80 dark:bg-slate-800/80 p-4 text-sm shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                        >
                          <p className="font-semibold text-slate-900 dark:text-slate-50">
                            {idx + 1}. {item.question}
                          </p>
                          <div className="mt-2 space-y-1">
                            {item.options.map((opt, index) => {
                              const isCorrect = index === item.correctIndex;
                              const isChosen = index === item.selectedIndex;
                              let classes =
                                "rounded-xl border px-3 py-2 text-xs md:text-sm transition-colors";
                              if (isCorrect && isChosen) {
                                classes +=
                                  " border-green-500 bg-green-50 text-green-800 dark:border-green-500 dark:bg-green-900/30 dark:text-green-200";
                              } else if (isCorrect) {
                                classes +=
                                  " border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-200";
                              } else if (isChosen) {
                                classes +=
                                  " border-red-500 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-900/30 dark:text-red-200";
                              } else {
                                classes +=
                                  " border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
                              }
                              return (
                                <div key={index} className={classes}>
                                  {String.fromCharCode(65 + index)}. {opt}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>
                              {isHindi ? "आपका जवाब: " : "Your answer: "}
                              {item.selectedIndex === null
                                ? isHindi
                                  ? "कोई नहीं"
                                  : "None"
                                : String.fromCharCode(65 + item.selectedIndex)}
                            </span>
                            <span>
                              {isHindi ? "सही जवाब: " : "Correct answer: "}
                              {String.fromCharCode(65 + item.correctIndex)}
                            </span>
                            <span>
                              {isHindi ? "स्थिति: " : "Result: "}
                              <span
                                className={
                                  item.selectedIndex === null
                                    ? "font-semibold text-slate-600 dark:text-slate-300"
                                    : item.isCorrect
                                    ? "font-semibold text-green-600 dark:text-green-400"
                                    : "font-semibold text-red-600 dark:text-red-400"
                                }
                              >
                                {item.selectedIndex === null
                                  ? isHindi
                                    ? "छोड़ा गया"
                                    : "Skipped"
                                  : item.isCorrect
                                  ? isHindi
                                    ? "सही"
                                    : "Correct"
                                  : isHindi
                                  ? "गलत"
                                  : "Wrong"}
                              </span>
                            </span>
                            <span>
                              {isHindi ? "समय: " : "Time: "} {item.timeTaken}s
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRestart}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">
                    {isHindi ? "🔥 Quiz dobara start karein" : "🔥 Start quiz again"}
                  </span>
                </button>
              </div>
          ) : (
            currentQuestion && (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      {isHindi ? "प्रश्न" : "Question"} {currentIndex + 1} / {questions.length}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                      {isHindi ? "कुल समय:" : "Total"} {totalMinutes.toString().padStart(2, "0")}:
                      {totalSecondsR.toString().padStart(2, "0")}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                      {isHindi ? "इस प्रश्न के लिए समय:" : "Time left:"} {qMinutes.toString().padStart(2, "0")}:
                      {qSeconds.toString().padStart(2, "0")}
                    </span>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                      {isHindi ? "अंक:" : "Score:"} {score}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 shadow-inner">
                    <div 
                      className="h-full rounded-full multi-color-gradient transition-all duration-500 ease-out shadow-md"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question Card with Golden Glow */}
                <div className="rounded-2xl bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-700/50 dark:via-slate-800/50 dark:to-slate-700/50 p-6 ring-1 ring-yellow-200/60 dark:ring-yellow-600/30 transition-all duration-300 hover:shadow-md hover:ring-yellow-300/70 dark:hover:ring-yellow-500/50">
                  <p className="text-lg font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.subject && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 dark:from-yellow-600 dark:to-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
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
                        onClick={() => !finished && handleOptionClick(index)}
                        disabled={finished}
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
                      className="group relative overflow-hidden rounded-full border-2 border-orange-400 bg-gradient-to-r from-orange-200 to-amber-200 px-4 py-2 text-xs font-semibold text-orange-800 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
                      className="group relative overflow-hidden rounded-full border-2 border-purple-400 bg-gradient-to-r from-purple-200 to-pink-200 px-4 py-2 text-xs font-semibold text-purple-800 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <span className="relative z-10">⏭️ Skip ({skipLeft})</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                    <button
                      type="button"
                      disabled={hintUsed}
                      onClick={handleHint}
                      className="group relative overflow-hidden rounded-full border-2 border-cyan-400 bg-gradient-to-r from-cyan-200 to-blue-200 px-4 py-2 text-xs font-semibold text-cyan-800 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
                  {currentIndex === questions.length - 1 && (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={finished}
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <span className="relative z-10">
                        {isHindi ? "सबमिट" : "Submit"}
                      </span>
                    </button>
                  )}
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

