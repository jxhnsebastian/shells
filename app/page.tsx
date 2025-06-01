import SiteLayout from "@/components/layout/SiteLayout";
import { Film, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  return (
    <SiteLayout>
      <div className="flex items-center gap-4">
        <HomeItem route="/search" text="movies" icon={Film} />
        <HomeItem route="/flow" text="flow" icon={DollarSign} />
      </div>
    </SiteLayout>
  );
}

const HomeItem = ({
  route,
  text,
  icon: Icon,
}: {
  route: string;
  text: string;
  icon: any;
}) => {
  return (
    <Button variant="outline" asChild>
      <Link
        href={route}
        className="w-[7rem] h-[7rem] flex flex-col items-center justify-center gap-2"
      >
        <Icon className="w-[3rem] h-[3rem]" />
        <span>{text}</span>
      </Link>
    </Button>
  );
};
