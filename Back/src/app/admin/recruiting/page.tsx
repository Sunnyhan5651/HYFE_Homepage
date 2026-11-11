import { AdminShell } from "@/components/admin/AdminShell";
import { RecruitmentAssetUploadForm } from "@/components/admin/RecruitmentAssetUploadForm";
import { requireRole } from "@/lib/auth/session";
import { loadDemoDatabase } from "@/lib/db/local-store";
import { activeRecruitmentAsset, RECRUITMENT_ASSET_CONFIG, RECRUITMENT_ASSET_TYPES } from "@/lib/recruiting/assets";
import { blobAccess } from "@/lib/storage/object-storage";

export const dynamic = "force-dynamic";

export default async function AdminRecruitingPage() {
  await requireRole("ADMIN");
  const db = await loadDemoDatabase();

  return (
    <AdminShell activeHref="/admin/recruiting" title="리크루팅 자료 관리" description="지원서와 학회 안내자료 파일을 업로드하고 활성 상태를 관리합니다.">
      <div className="featureGrid">
        {RECRUITMENT_ASSET_TYPES.map((assetType) => {
          const config = RECRUITMENT_ASSET_CONFIG[assetType];
          const activeAsset = activeRecruitmentAsset(db.recruitmentAssets, assetType);
          return (
            <article className="authCard formStack" key={assetType}>
              <h3>{config.label}</h3>
              {activeAsset ? (
                <p className="muted">
                  현재 파일: {activeAsset.originalFilename} · {activeAsset.downloadCount.toLocaleString("ko-KR")} downloads
                </p>
              ) : (
                <p className="muted">활성 파일이 없습니다.</p>
              )}
              <RecruitmentAssetUploadForm assetType={assetType} label={config.label} blobAccess={blobAccess()} />
            </article>
          );
        })}
      </div>

      <div className="featureGrid">
        {RECRUITMENT_ASSET_TYPES.map((assetType) => {
          const config = RECRUITMENT_ASSET_CONFIG[assetType];
          const assets = db.recruitmentAssets
            .filter((asset) => asset.assetType === assetType)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          return (
            <article className="authCard formStack" key={`${assetType}-history`}>
              <h3>{config.label} 이력</h3>
              {assets.length ? (
                assets.map((asset) => (
                  <form className="metaRow" key={asset.id} action={`/api/admin/recruiting/${asset.id}`} method="post">
                    <div>
                      <b>{asset.originalFilename}</b>
                      <p className="muted">
                        {asset.isActive ? "활성" : "비활성"} · {asset.downloadCount.toLocaleString("ko-KR")} downloads
                      </p>
                    </div>
                    <label className="metaRow">
                      <input name="isActive" type="checkbox" value="true" defaultChecked={asset.isActive} />
                      활성
                    </label>
                    <button className="button secondary small" type="submit">
                      저장
                    </button>
                  </form>
                ))
              ) : (
                <p className="muted">업로드된 파일이 없습니다.</p>
              )}
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}
