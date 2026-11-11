import { TeamBoardPage } from "@/components/member/TeamBoardPage";

export const dynamic = "force-dynamic";

export default function ResearchTeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TeamBoardPage team="research" searchParams={searchParams} />;
}
