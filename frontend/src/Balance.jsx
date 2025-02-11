import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getBalance } from "./api";

export function Balance(){
    const params = useParams();
    const {isLoading, isError, data } = useQuery(["balance", params.address], getBalance);
    
    //Acceder al servidor para obtener los datos del bloque
    if (isLoading) 
        return (<div>Loading...</div>);
    if (isError) 
        return (<div>Error</div>);

    return (
        <pre>
            {JSON.stringify(data, null, 4)}
        </pre>
    );
}
