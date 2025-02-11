import {Outlet, Link} from "react-router-dom";

export function Home(){
    return(
        <div className="container">
            <div className="text-end border p-2">
                <Link className="mx-2" to="/carrito">Carrito 🛒</Link>
                <Link to="/productos">Productos 📦 </Link>
            </div>
            <div className="p-3 border">
                <Outlet />
            </div>
        </div>
    );
}

