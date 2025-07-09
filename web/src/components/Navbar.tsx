// src/components/Navbar.tsx
import Link from 'next/link';
import Header from './Header';

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Header title="Blockchain Láctea" />
        <div className="space-x-4">
          <Link href="/">
            Home
          </Link>
          <Link href="/admin">Admin</Link>
          <Link href="/producer">Producer</Link>
          <Link href="/transport">Transport</Link>
          <Link href="/processor">Processor</Link>
        </div>
      </div>
    </nav>
  );
}