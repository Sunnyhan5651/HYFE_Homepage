import { AccessNotice } from "@/components/auth/AccessNotice";
import { PostEditor } from "@/components/boards/PostEditor";
import { requireRole } from "@/lib/auth/session";
import { TEAM_CATEGORY_OPTIONS } from "@/lib/board-policy/post-categories";
import { TEAM_ROUTE_CONFIG, type TeamSlug } from "@/lib/board-policy/team-routes";
import { getEditablePost } from "@/lib/db/post-repository";

export async function NewTeamPostEditorPage({ team }: { team: TeamSlug }) {
  try {
    await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const config = TEAM_ROUTE_CONFIG[team];

  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>{config.koreanLabel} 자료 작성</h2>
          <p className="sectionLead">팀 리서치 진행 상황과 세션 자료를 공유합니다.</p>
        </div>
        <PostEditor
          endpoint={`/api/member/teams/${team}/posts`}
          categoryOptions={TEAM_CATEGORY_OPTIONS}
          initialCategory="session-material"
          initialVisibility="PRIVATE"
          allowVisibility
        />
      </div>
    </main>
  );
}

export async function EditTeamPostEditorPage({ team, id }: { team: TeamSlug; id: string }) {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const config = TEAM_ROUTE_CONFIG[team];
  const post = await getEditablePost({ id, expectedBoardType: config.boardType, actor: { id: user.id, role: user.role } });
  if (!post) return <main className="section container"><h1>자료를 찾을 수 없습니다.</h1></main>;

  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>{config.koreanLabel} 자료 수정</h2>
        </div>
        <PostEditor
          endpoint={`/api/posts/${id}`}
          initialTitle={post.title}
          initialContent={post.content}
          initialCategory={post.category}
          initialVisibility={post.visibility}
          categoryOptions={TEAM_CATEGORY_OPTIONS}
          allowVisibility
        />
      </div>
    </main>
  );
}
