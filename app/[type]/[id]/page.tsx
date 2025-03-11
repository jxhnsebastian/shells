import SiteLayout from "@/components/layout/SiteLayout";
import MediaDetailsPage from "@/components/pages/MediaDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  return (
    <SiteLayout>
      <MediaDetailsPage id={id} mediaType={type} />
    </SiteLayout>
  );
}
