import Link from "next/link";
import { UserNav } from "./UserNav";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-accent-light">
        <div className=" px-4 py-3 flex items-center justify-between bg-background">
          <Link href="/" className="text-2xl font-bold text-accent-light">
            Shells
          </Link>
          <UserNav />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <footer className="">
        <div className="container mx-auto px-4 text-center text-charcoal">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Shells. Movie data provided by
            TMDB.
          </p>
        </div>
      </footer>
    </div>
  );
}
