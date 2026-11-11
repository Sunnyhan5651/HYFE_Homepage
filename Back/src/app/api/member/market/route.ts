import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { hasRoleAtLeast } from "@/lib/authorization/roles";
import { teamConfig } from "@/lib/board-policy/team-routes";
import { createPost, listPostsByBoards } from "@/lib/db/post-repository";

const MARKET_TEAMS = ["ib", "research", "derivatives", "quant"] as const;
const MARKET_BOARD_TYPES = MARKET_TEAMS.map((team) => teamConfig(team).boardType);

function isMarketTeam(value: unknown): value is (typeof MARKET_TEAMS)[number] {
  return typeof value === "string" && MARKET_TEAMS.includes(value as (typeof MARKET_TEAMS)[number]);
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해 주세요." }, { status: 401 });
  if (!hasRoleAtLeast(user.role, "MEMBER")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  const url = new URL(request.url);
  return NextResponse.json({
    ok: true,
    posts: await listPostsByBoards(MARKET_BOARD_TYPES, {
      category: "session-material",
      q: url.searchParams.get("q"),
    }),
  });
}

export async function POST(request: Request) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해 주세요." }, { status: 401 });
  if (!hasRoleAtLeast(user.role, "MEMBER")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  try {
    const payload = await request.json();
    if (!isMarketTeam(payload.team)) throw new Error("시황을 등록할 팀을 선택해 주세요.");
    const post = await createPost({
      actor: { id: user.id, role: user.role },
      boardType: teamConfig(payload.team).boardType,
      payload: {
        title: payload.title,
        content: payload.content,
        visibility: payload.visibility,
        category: "session-material",
      },
    });
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 400 });
  }
}
