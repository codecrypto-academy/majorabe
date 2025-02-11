import React, { useState, useEffect, createContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from'react-router-dom';
import { QueryClient, QueryClientProvider} from 'react-query';
import { Home } from './componentes/Home';
import { Productos } from './componentes/Productos';
import { Producto } from './componentes/Producto';
import { Carrito } from './componentes/Carrito';
import './index.css';

const queryClient = new QueryClient();
//contexto global para compartir el esatdo del carrito
export const Context = createContext(null);

function App(){
 // Estado global para el carrito de compras
 const [estado, setEstado] = useState({
    carrito: []
  });

  return (
    <Context.Provider value={[estado, setEstado]}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} >
              <Route index element={<Productos />} ></Route>
              <Route path="*" element={<Productos />} ></Route>
              <Route path="productos" element={<Productos />} ></Route>
              <Route path="productos/:id" element={<Producto />} ></Route>
              <Route path="carrito" element={<Carrito />} ></Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Context.Provider>
  );
} 

// Verificar que el div 'root' existe antes de renderizar
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("⚠️ Error: No se encontró el elemento 'root' en el HTML.");
}