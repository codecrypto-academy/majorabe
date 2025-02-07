import { useContext, useState } from "react";
import { UserContext } from "@/App";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export function Faucet(){
    const { state, setState } = useContext(UserContext);
    const [tx, setTx] = useState<object|null>(null);
    const [loading, setLoading] = useState(false);
    
    async function handlerClick(){
        setLoading(true); //comienza la carga
        const result = await fetch(`http://localhost:3333/api/faucet/${state.acc}/1`);
        const data = await result.json();
        setTx(data);
        console.log(data);
        setLoading(false); //termina la carga
    }

    return (
    <div className="p-6">
        <h1 className="text-2xl font-semibold">Faucet</h1>
        <p className="text-gray-600 mt-2"> Cuenta
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{state.acc}</span>
        </p>

        <div className="my-4">
            <Button onClick={handlerClick} disabled={loading}>
            {loading && <Loader2 className="mr-2 h4 w-4 animate-spin"/>}
            Solicitar fondos
            </Button>
        </div>
        
        {loading && (
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Por favor espere mientras se realiza la operación...</span>
        </div>
        )}

      
        
     
        {tx && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="text-lg font-semibold">Transacción:</h2>
            <code className="block text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(tx, null, 4)}
            </code>
          </div>
        )}
    </div>);
}
