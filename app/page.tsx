import SiteLayout from "@/components/layout/SiteLayout";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  return (
    <SiteLayout>
      <div className="space-y-8 flex items-center">
        <HomeItem route="/search" text="movies" />
      </div>
    </SiteLayout>
  );
}

const HomeItem = ({ route, text }: { route: string; text: string }) => {
  return (
    <Button variant="outline" asChild>
      <Link href={route} className="w-[7rem] h-[7rem]">
        <Film className="w-[5rem] h-[5rem]" />
        <span>{text}</span>
      </Link>
    </Button>
  );
};
