import { useContext, useEffect, useState } from 'react';
import { Context } from '../main';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

export function Carrito() {
    const [estado] = useContext(Context);
    const [cuenta, setCuenta] = useState(null);
    const [txOk, setTxOk] = useState(null);
    const [txCancel, setTxCancel] = useState(null);

    // Cálculo del total de la compra
    const total = estado.carrito.reduce((acc, item) => acc + item.total, 0);

    // Obtener cuenta de MetaMask
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(cuentas => {
                    setCuenta(cuentas[0]);
                    ethereum.on('accountsChanged', cuentas => setCuenta(cuentas[0]));
                })
                .catch(console.error);
        }
    }, []);

    async function pagar() {
        if (!cuenta) {
            alert("Por favor, conecta tu cuenta de MetaMask.");
            return;
        }

        const txParam = {
            to: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
            from: cuenta,
            value: ethers.parseEther(total.toString()).toString()
        };

        console.log("Enviando transacción:", txParam);

        try {
            const tx = await ethereum.request({
                method: 'eth_sendTransaction',
                params: [txParam]
            });
            setTxOk(`Transacción enviada: ${tx}`);
            setTxCancel(null);
        } catch (error) {
            setTxCancel(`Error en la transacción: ${error.message}`);
            setTxOk(null);
        }
    }

    return (
        <div className="container mt-4">
            <h1 className="text-2xl font-semibold">Carrito de Compras</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {estado.carrito.map(i => (
                        <tr key={i.producto.ProductID}>
                            <td>
                                <Link to={`/productos/${i.producto.ProductID}`} className="text-primary">
                                    {i.producto.ProductName}
                                </Link>
                            </td>
                            <td>${i.producto.UnitPrice}</td>
                            <td>{i.cantidad}</td>
                            <td>${i.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 className="mt-3">Total Compra: ${total}</h3>
            {/* Muestra la cuenta solo si está conectada */}
            {cuenta && (
                <div className="text-secondary mt-2">
                    Cuenta conectada: <code className="bg-light p-1 rounded">{cuenta}</code>
                </div>
            )}

            <button onClick={pagar} className="btn btn-primary mt-3">Pagar</button>

            {txOk && <div className="alert alert-success mt-3">{txOk}</div>}
            {txCancel && <div className="alert alert-danger mt-3">{txCancel}</div>}
        </div>
    );
}
