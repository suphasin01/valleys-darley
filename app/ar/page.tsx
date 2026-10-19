import { redirect } from 'next/navigation';

export const metadata = { title: 'Choose Your Design — Valley’s Darling' };

export default async function ARPage() {
  // Keep previously shared links working without loading the camera experience.
  redirect('/custom-made');
}
