import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-5xl flex-col gap-24 px-6 pb-24 pt-16">
        <section
          id="home"
          className="mt-8 flex flex-col items-center justify-between gap-10 rounded-3xl bg-white px-8 py-12 shadow-sm dark:bg-zinc-950 sm:flex-row"
        >
          <div className="space-y-4 text-center sm:max-w-md sm:text-left">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Welcome to 8Rupiya
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Ye aapka home section hai. Yahan se aap apni sari information aur
              important links dekh sakte ho.
            </p>
          </div>
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
        </section>

        <section
          id="education"
          className="rounded-3xl bg-white px-8 py-12 shadow-sm dark:bg-zinc-950"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Education
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Ye education section hai. Yahan aap apni padhaai se related
            information, courses, classes ya notes show kar sakte ho. Filhaal
            maine yahan placeholder text rakha hai, aap apne hisaab se content
            change kar sakte ho.
          </p>
        </section>
      </main>
    </div>
  );
}
