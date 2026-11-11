import { AdminShell } from "@/components/admin/AdminShell";
import { requireRole } from "@/lib/auth/session";
import { loadDemoDatabase } from "@/lib/db/local-store";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  await requireRole("ADMIN");
  const db = await loadDemoDatabase();

  return (
    <AdminShell activeHref="/admin/banners" title="배너 관리" description="배너 이미지 파일은 public/images/banners에 저장되어 있습니다.">
        <div className="featureGrid">
          {db.banners.map((banner) => (
            <form className="authCard formStack" key={banner.id} action={`/api/admin/banners/${banner.id}`} method="post">
              <h3>{banner.pageKey}</h3>
              <div className="formGroup">
                <label htmlFor={`${banner.id}-alt`}>대체 텍스트</label>
                <input id={`${banner.id}-alt`} className="field" name="altText" defaultValue={banner.altText} />
              </div>
              <div className="formGroup">
                <label htmlFor={`${banner.id}-overlay`}>오버레이</label>
                <input
                  id={`${banner.id}-overlay`}
                  className="field"
                  name="overlayOpacity"
                  type="number"
                  min="0"
                  max="0.9"
                  step="0.05"
                  defaultValue={banner.overlayOpacity}
                />
              </div>
              <button className="button" type="submit">
                배너 저장
              </button>
            </form>
          ))}
        </div>
    </AdminShell>
  );
}
