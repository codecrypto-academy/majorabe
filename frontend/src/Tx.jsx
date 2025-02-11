import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getTx } from "./api";
import { Link } from "react-router-dom";
export function Tx(){
    const params = useParams();
    const {isLoading, isError, data } = useQuery(["tx", params.tx], getTx);
    
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
                        <th>Block</th>
                        <td>
                            <Link to={`/bloque/${data.blockNumber}`}>
                            {data.blockNumber}
                            </Link>
                        </td>
                    </tr>
                    <tr>
                        <th>From</th>
                        <td>
                            <Link to={`/balance/${data.from}`}>
                            {data.from}
                            </Link>
                        </td>
                    </tr>
                    <tr>
                        <th>To</th>
                        <td><Link to={`/balance/${data.to}`}>
                            {data.to}
                            </Link>
                        </td>
                    </tr>
                    <tr>
                        <th>Value</th>
                        <td>{data.value}</td>
                    </tr>
                </thead>
            </table>
            <pre>
                {JSON.stringify(data, null, 4)}
            </pre>
        </div>
    );
}
