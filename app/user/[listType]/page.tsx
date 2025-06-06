import SiteLayout from "@/components/layout/SiteLayout";
import ListItemPage from "@/components/pages/ListItemPage";

export default async function Page({
  params,
}: {
  params: Promise<{ listType: string }>;
}) {
  const { listType } = await params;
  return (
    <SiteLayout>
      <ListItemPage listType={listType} />
    </SiteLayout>
  );
}
