import { TeamBoardPage } from "@/components/member/TeamBoardPage";

export const dynamic = "force-dynamic";

export default function DerivativesTeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TeamBoardPage team="derivatives" searchParams={searchParams} />;
}
