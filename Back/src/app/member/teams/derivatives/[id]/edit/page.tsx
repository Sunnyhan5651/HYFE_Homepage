import { EditTeamPostEditorPage } from "@/components/member/TeamPostEditorPage";

export const dynamic = "force-dynamic";

export default async function EditDerivativesPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditTeamPostEditorPage team="derivatives" id={id} />;
}
