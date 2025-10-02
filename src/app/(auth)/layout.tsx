import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex flex-col">
      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-navy-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity w-fit">
            <Image
              src="/images/logo.jpg"
              alt="301st RRIBn Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <div className="text-yellow-500 font-bold text-sm tracking-wider">
                301st READY RESERVE
              </div>
              <div className="text-white font-semibold text-xs">
                INFANTRY BATTALION
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-500/20 bg-navy-900/80 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-gray-400 text-xs">
          <p>&copy; {new Date().getFullYear()} 301st Ready Reserve Infantry Battalion</p>
          <p className="mt-1">Philippine Army Reserve Command</p>
        </div>
      </footer>
    </div>
  );
}
