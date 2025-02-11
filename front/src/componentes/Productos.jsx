import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

export function Productos(){
    
    const {data, isLoading} = useQuery("productos", () => {
        return fetch("http://localhost:5555/productos").then(res => res.json());
     })
     
    if (isLoading) {
        return <div>Cargando...</div>
    }
    
    return(
        <div>
             <h1 className="text-2xl font-semibold">Lista de Productos</h1>
            <div>
            <table className="table">
                <thead>
                    <tr> 
                        <th>Nombre</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(product => (
                        <tr key={product.ProductID}>
                        <td>
                            <Link to={`/productos/${product.ProductID}`}> {product.ProductName}</Link>
                        </td>
                        </tr>    
                        ))}
                </tbody>
            </table>
           </div>
        </div>
    );
}
