import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/App";

export function Balance(){
    const { state, setState } = useContext(UserContext);
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {  
        
        const ethereum = window.ethereum;
        if(ethereum == null){
            alert("Por favor instale MetaMask");
            return;
        }
        
        ethereum.request({ method: "eth_getBalance", params: [state.acc] })
        .then((data:string) => {
            console.log(Number(data)/10**18);
            setBalance(Number(data)/10**18);
          })
        },[state.acc]);


    return (
        <div className="p-6">
        <h1 className="text-2xl font-semibold">Balance</h1>

        <p className="text-gray-600 mt-2"> Cuenta:
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{state.acc}</span>
        </p>
        <p className="text-gray-600 mt-2"> Balance: 
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{balance}</span>
        </p>


    </div>);
}
