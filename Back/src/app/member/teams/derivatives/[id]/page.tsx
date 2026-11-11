import { TeamDetailPage } from "@/components/member/TeamDetailPage";

export const dynamic = "force-dynamic";

export default async function DerivativesTeamDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamDetailPage team="derivatives" id={id} />;
}
