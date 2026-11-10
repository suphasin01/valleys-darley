'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const groups = [
  { title: 'shop', href: '/shop', links: [['necklace','/shop/necklace'],['ring','/shop/ring'],['earrings','/shop/earrings'],['bracelet','/shop/bracelet'],['custom made','/custom-made'],['collection','/shop/be-present']] },
  { title: 'help', href: '/help', links: [['contact us','/help#contact'],['after sale services','/help#after-sales'],['care instruction','/help#care'],['shipping and return','/help#shipping'],['size guide','/help#size-guide']] },
  { title: 'about us', href: '/about', links: [['stories','/about#stories'],['where to find us','/about#where-to-find-us'],['our packaging','/about#packaging']] },
  { title: 'privacy policy', href: '/privacy', links: [['term of service','/terms']] },
];
export function SuppliedFooter() {
  const pathname = usePathname();
  return <div className="supplied-ui"><footer><nav className="footer" aria-label="Footer navigation">{groups.map(group => <div key={group.title}><Link href={group.href} className="footer-head">{group.title}</Link>{group.links.map(([text,href]) => <Link key={text} href={href}>{text}</Link>)}</div>)}</nav>{(pathname === '/' || pathname === '/help') && <Link href="/" aria-label="Valley's Darling home" className="footer-logo">Valley&apos;s Darling</Link>}</footer></div>;
}
