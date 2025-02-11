import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { Context } from '../main';

export function Producto(){
    const params = useParams();
    const [estado, setEstado] = useContext(Context);

    //Consulto el estado para conocer la cantidad del producto (si ya fue elegido antes)
    //const cantidad = estado.carrito.find(i=>i.producto.ProductoID == params.id)?.cantidad;
    const cantidad = estado.carrito?.find(i => i.producto.ProductoID == params.id)?.cantidad || 0;

    console.log(`cantidad: ${cantidad}`);

    //Hook para manejar el formulario
    const { register, handleSubmit } = useForm({
        defaultValues: { cantidad: cantidad }
    });

    const {data, isLoading} = useQuery("producto", () => {
        return fetch(`http://localhost:5555/productos/${params.id}`).then(res => res.json());
     })
    
    function onSubmit(datos) {
        console.log(datos);
        if (datos.cantidad == 0)
            return;
        //Actualizao el estado del carrito
      /*  setEstado({
        ...estado, carrito:
        [...estado.carrito.filter(i => i.producto.ProductID != data[0].ProductID), { 
            producto: data[0], 
            total: datos.cantidad * data[0].UnitPrice, 
            cantidad: datos.cantidad 
        }]
        });*/
  
    setEstado({
        ...estado,
        carrito: [
            ...estado.carrito.filter(i => i.producto.ProductID != data[0].ProductID),
            {
                producto: data[0],
                total: datos.cantidad * data[0].UnitPrice,
                cantidad: Number(datos.cantidad) // Asegurar que cantidad es un número
            }
        ]
    });
}





    if (isLoading) {
        return <div>Cargando...</div>
    }
    
    return (
        <div className="container mt-4">
            <h1 className="text-3xl font-semibold mb-4">Detalles del Producto</h1>
            
            {/* Tabla de detalles del producto */}
            <table className="table table-bordered table-striped mb-4">
                <thead className="thead-light">
                    <tr>
                        <th>Id</th>
                        <td>{data[0].ProductID}</td>
                    </tr>
                    <tr>
                        <th>Nombre</th>
                        <td>{data[0].ProductName}</td>
                    </tr>
                    <tr>
                        <th>Precio</th>
                        <td>${data[0].UnitPrice.toFixed(2)}</td>
                    </tr>
                </thead>
            </table>

            {/* Formulario para agregar cantidad */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group mb-3">
                    <label className="form-label">Cantidad</label>
                    <input
                        {...register('cantidad')}
                        type="number"
                        className="form-control"
                        min="1"
                        max="9999"
                        style={{ width: '100px' }}
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-3">Añadir al carrito</button>
            </form>

            {/* Mostrar el estado de carrito de manera legible */}
            <div className="mt-4">
                <h4>Estado del Carrito:</h4>
                <pre>{JSON.stringify(estado, null, 2)}</pre>
            </div>
        </div>
    );}
