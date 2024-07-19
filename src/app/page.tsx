import Image from "next/image";

import LoginForm from "@/src/app/components/LoginForm";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-yellow-300 to-red-400 antialiased">
      <div className="container mx-auto px-6">
        <div className="flex h-screen flex-col justify-evenly text-center md:flex-row md:items-center md:text-left">
          <div className="flex w-full flex-col">
            <div className="justfy-center flex h-64 w-64 items-center">
              <Image src="/eusoff-logo.png" alt="Vercel Logo" width={400} height={24} priority />
            </div>
            <h1 className="text-7xl font-bold text-gray-800">Eusoff Hall</h1>
            <p className="mx-auto w-5/12 pl-5 text-gray-700 md:mx-0">Excellence and Harmony</p>
          </div>
          <div className="mx-auto w-full md:mx-0 md:w-full lg:w-9/12">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
