
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getBlock } from "./api";
import { Link } from "react-router-dom";


export function Bloque(){

    const params = useParams();
    const {isLoading, isError, data } = useQuery(["bloque", params.bloque], getBlock);
    //Acceder al servidor para obtener los datos del bloque
    if (isLoading) 
        return (<div>Loading...</div>);
    if (isError) 
        return (<div>Error</div>);

    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Lista de Transacciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.transactions.map((item, index)=>
                        <tr key={index}>
                            <td>
                                <Link to={`/tx/${item}`}>
                                {item}
                                </Link>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
       
        <pre>
            {JSON.stringify(data, null, 4)}
        </pre>
        </div>
    );
}
