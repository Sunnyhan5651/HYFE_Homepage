import { TeamBoardPage } from "@/components/member/TeamBoardPage";

export const dynamic = "force-dynamic";

export default function QuantTeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TeamBoardPage team="quant" searchParams={searchParams} />;
}
