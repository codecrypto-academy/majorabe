// src/pages/index.tsx
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <div className="text-center py-20">
        <h2 className="text-3xl font-semibold mb-10">Bienvenido a Blockchain Láctea</h2>
        
        <div className="flex justify-center items-center space-x-4">
          <Link href="/admin">
            <div className="flex flex-col items-center">
              <img src="/vaca.png" alt="Productor" className="h-20 w-20" />
              <span className="text-sm mt-2">Productor</span>
            </div>
          </Link>
          <img src="/flecha.png" className="h-10 w-10" />

          <Link href="/producer">
            <div className="flex flex-col items-center">
              <img src="/transporte.png" alt="Transportista" className="h-20 w-20" />
              <span className="text-sm mt-2">Transportista</span>
            </div>
          </Link>
          <img src="/flecha.png" className="h-10 w-10" />

          <Link href="/processor">
            <div className="flex flex-col items-center">
              <img src="/industria.png" alt="Procesador" className="h-20 w-20" />
              <span className="text-sm mt-2">Planta Procesadora</span>
            </div>
          </Link>
          <img src="/flecha.png" className="h-10 w-10" />

          <Link href="#">
            <div className="flex flex-col items-center">
              <img src="/distribuidor.png" alt="Distribuidor" className="h-20 w-20" />
              <span className="text-sm mt-2">Distribuidor</span>
            </div>
          </Link>
          <img src="/flecha.png" className="h-10 w-10" />

          <Link href="#">
            <div className="flex flex-col items-center">
              <img src="/minorista.png" alt="Minorista" className="h-20 w-20" />
              <span className="text-sm mt-2">Minorista</span>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
