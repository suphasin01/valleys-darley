import { redirect } from 'next/navigation';
import { safeMemberNext } from '../lib/auth';
export default async function Signup({searchParams}:{searchParams:Promise<{next?:string}>}) {
  const {next} = await searchParams;
  redirect(`/register?next=${encodeURIComponent(safeMemberNext(next))}`);
}
