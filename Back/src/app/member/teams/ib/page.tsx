import { TeamBoardPage } from "@/components/member/TeamBoardPage";

export const dynamic = "force-dynamic";

export default function IbTeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TeamBoardPage team="ib" searchParams={searchParams} />;
}
