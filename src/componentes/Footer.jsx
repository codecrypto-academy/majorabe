import datos from "../datos.json";
import PropTypes from "prop-types";
import {Logo} from "./Logo"

function Section({ data }){
    return (
        <div>
        <h5>{data.titulo}</h5>
            <ul className="nav flex-column">
                {data.links.map((i, index)=>
                    <li key={index}>
                        <a className="text-decoration-none" target="_blank" rel="noopener noreferrer" href={i.url}>
                            {i.titulo}
                        </a>
                    </li>          
                )}
            </ul>
        </div> 
    )
}
//En JavaScript PropTypes ayuda a definir qué tipo de datos debe recibir un componente.
Section.propTypes = {
    // data que recibe Section debe ser un objeto con una estructura específica
    data: PropTypes.shape({   
            titulo: PropTypes.string.isRequired,    //   `titulo` debe ser una cadena obligatoria
            links:  PropTypes.arrayOf(              //   `links` debe ser un array de objetos. Cada uno tener los campos titulo y url
                        PropTypes.shape({                  
                                titulo: PropTypes.string.isRequired, 
                                url: PropTypes.string.isRequired,    
                        })
                    ).isRequired, // `links` es obligatorio y debe contener al menos un objeto
    }).isRequired,  // `data` es obligatorio
  };
  

export function Footer(){
    return  (
        <div className ="d-flex justify-content-between mt-4">
            <div className ="d-flex">
            <Logo width={150} height={150} alt={datos.header.nombre} />



            </div>
            { datos.footer.map((item, index) =>
                     <Section data={item} key={index}></Section>)
            }
        </div>);
}