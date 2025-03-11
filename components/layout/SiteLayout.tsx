import Link from "next/link";
import { UserNav } from "./UserNav";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="h-[100dvh] font-mono w-full overflow-x-hidden overflow-auto flex flex-col">
      <header className="z-10">
        <div className=" px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-accent-light">
            shells
          </Link>
          <UserNav />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <footer className="z-10">
        <div className="container mx-auto px-4 text-center text-charcoal">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} shells. movie data provided by
            tmdb.
          </p>
        </div>
      </footer>
    </div>
  );
}
