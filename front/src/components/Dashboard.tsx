import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function Dashboard(){
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* Contenedor Principal */}
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

           {/* Contenedor con margen y padding para el Outlet */}
          <div className="bg-white shadow-md rounded-lg p-6">
          <Outlet />
          </div>
      </div>
    </div>
    );
  }

