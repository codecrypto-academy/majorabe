import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useContext, useEffect } from "react";
import { UserContext } from "@/App";

export function Header(){
  const { state, setState } = useContext(UserContext);
  useEffect(() =>{
      const ethereum = (window as any).ethereum;
      if(ethereum == null){
        alert("Por favor instale MetaMask");
        return;
      }
      ethereum.request({ method: "eth_requestAccounts"}).then((acc:string[]) => {
        setState({acc: acc[0]});
      });
      ethereum.on("accountsChanged", function (acc:string[]){
        setState({acc: acc[0]});
      });

  });
  
  return (
      <div className="flex gap-2 justify-center pt-4">
        <Link to='home'><Button>Home</Button></Link>
        <Link to='faucet'><Button>Faucet</Button></Link>
        <Link to='balance'><Button>Balance</Button></Link>
        <Link to='transfer'><Button>Transfer</Button></Link>
        <div className="flex items-center space-x-2">
        {state.acc ? (
          <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full border border-gray-300">
            {state.acc.substring(0, 6)}...{state.acc.slice(-4)}
          </span>
        ) : (
          <span className="text-gray-500 text-sm">Cuenta no conectada</span>
        )}
      </div>
      </div>
    );
  }