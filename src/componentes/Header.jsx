import {Logo} from "./Logo"
import datos from "../datos.json"

export function Header(){
    return (<div className ="my-2 text-dark d-flex justify-content-between align-items-center">
            <div className ="d-flex align-items-center">
                <Logo width={50} height={50} alt={datos.header.nombre} />
                <h4 className="ms-2 mb-0">{datos.header.nombre}</h4>
            </div>
            <div>
                { datos.header.links.map((item, index) => 
                    <a key={index} className="mx-3 text-decoration-none" href={item.url}> {item.texto} </a>)
                }
            </div> 

            </div>);
}
