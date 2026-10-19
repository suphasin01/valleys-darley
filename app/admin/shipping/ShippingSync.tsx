'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function ShippingSync({ ids }: { ids: string[] }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const key = JSON.stringify(ids);
  useEffect(() => {
    if (!ids.length) return;
    let stopped = false; let running = false;
    const sync = async () => {
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      try {
        let changed = 0; let failed = 0;
        for (let index = 0; index < ids.length; index += 10) {
          if (stopped) break;
          const response = await fetch('/api/admin/shipping/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ids.slice(index, index + 10) }), signal: AbortSignal.timeout(30000) });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'ตรวจสถานะไม่สำเร็จ');
          changed += data.changed; failed += data.failed;
        }
        if (!stopped) { setMessage(failed ? `บางรายการตรวจสถานะไม่ได้ (${failed}) ระบบจะลองใหม่` : `ตรวจไปรษณีย์ไทยล่าสุด ${new Date().toLocaleTimeString('th-TH')}`); if (changed) router.refresh(); }
      } catch (error) { if (!stopped) setMessage(error instanceof Error ? error.message : 'ตรวจสถานะไม่สำเร็จ'); }
      finally { running = false; }
    };
    void sync(); const timer = setInterval(sync, 60000);
    return () => { stopped = true; clearInterval(timer); };
    // The serialized identifiers prevent a refresh from restarting unchanged batches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, router]);
  return <p role="status" className="mt-4 text-xs text-slate-500">อัปเดตจากไปรษณีย์ไทยทุก 60 วินาทีขณะเปิดหน้านี้ · {message || 'รอการตรวจสอบเลขพัสดุ'}</p>;
}
