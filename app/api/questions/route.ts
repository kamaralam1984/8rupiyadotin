import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type Question = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  subject?: string; // e.g. "UPSC - History", "Class 10 - Maths"
};

type StoredQuestion = Question & {
  translations?: {
    hi?: {
      question: string;
      options: string[];
    };
  };
};

const dataFilePath = path.join(process.cwd(), "data", "questions.json");
const baseDataFilePath = path.join(process.cwd(), "data", "baseQuestions.json");

function readQuestions(): Question[] {
  const file = fs.readFileSync(dataFilePath, "utf-8");
  return JSON.parse(file) as Question[];
}

function writeQuestions(questions: Question[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(questions, null, 2), "utf-8");
}

function readBaseQuestions(): StoredQuestion[] {
  try {
    const file = fs.readFileSync(baseDataFilePath, "utf-8");
    return JSON.parse(file) as StoredQuestion[];
  } catch {
    return [];
  }
}

function expandQuestionsPerSubject(baseQuestions: Question[], perSubject: number): Question[] {
  const bySubject: Record<string, Question[]> = {};

  baseQuestions.forEach((q) => {
    const key = q.subject || "General";
    if (!bySubject[key]) bySubject[key] = [];
    bySubject[key].push(q);
  });

  const expanded: Question[] = [];

  Object.entries(bySubject).forEach(([subject, qs]) => {
    if (qs.length === 0) return;
    for (let i = 0; i < perSubject; i++) {
      const base = qs[i % qs.length];
      expanded.push({
        ...base,
        id: `${base.id}-auto-${i + 1}`,
        question: `${base.question} (Set ${i + 1})`,
        subject,
      });
    }
  });

  return expanded;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectFilter = searchParams.get("subject") || undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  const lang = searchParams.get("lang") === "hi" ? "hi" : "en";

  const baseQuestions = readBaseQuestions();
  const expandedBase = expandQuestionsPerSubject(baseQuestions, 500);

  // Custom questions (admin se added) bhi include kar sakte hain
  let allQuestions: Question[] = [];
  try {
    allQuestions = expandedBase.concat(readQuestions());
  } catch {
    allQuestions = expandedBase;
  }

  let filtered = allQuestions;
  if (subjectFilter) {
    filtered = filtered.filter(
      (q) => (q.subject || "").toLowerCase() === subjectFilter.toLowerCase()
    );
  }

  // Apply language-specific translations (currently only hi supported)
  const mapped = filtered.map((q) => {
    if (lang === "hi") {
      const sq = q as StoredQuestion;
      const hi = sq.translations?.hi;
      if (hi && hi.question && Array.isArray(hi.options)) {
        return {
          ...q,
          question: hi.question,
          options: hi.options,
        };
      }
    }
    return q;
  });

  const limited =
    limit && limit > 0 ? mapped.slice(0, limit) : mapped;

  return NextResponse.json(limited);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Question>;

  if (!body.question || !body.options || body.answerIndex == null) {
    return NextResponse.json(
      { error: "question, options, answerIndex required" },
      { status: 400 }
    );
  }

  const questions = readQuestions();
  const newQuestion: Question = {
    id: body.id || `q${Date.now()}`,
    question: body.question,
    options: body.options,
    answerIndex: body.answerIndex,
    subject: body.subject || "General",
  };

  questions.push(newQuestion);
  writeQuestions(questions);

  return NextResponse.json(newQuestion, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Question> & { id: string };

  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const questions = readQuestions();
  const index = questions.findIndex((q) => q.id === body.id);

  if (index === -1) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  questions[index] = {
    ...questions[index],
    ...body,
  };

  writeQuestions(questions);

  return NextResponse.json(questions[index]);
}

export async function DELETE(request: Request) {
  const { id } = (await request.json()) as { id?: string };

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const questions = readQuestions();
  const filtered = questions.filter((q) => q.id !== id);

  writeQuestions(filtered);

  return NextResponse.json({ success: true });
}


