import datos from "../datos.json";
import PropTypes from "prop-types";

export function CardPrices({ data }) {
    return (
        <div className="card w-100 m-1">
            <div className="card-header">
                <h3 className="text-center"> 
                    {data.icono} {data.titulo}
                </h3>
            </div>
            <div className="card-body"> 
                <ul className="list-unstyled">
                    {data.features.map((i, index) => (
                        <li key={index} className="mt-1">{i}</li>          
                    ))}
                </ul>
                <h4 className="text-center m-lg-2">{data.precio}</h4> 
                <button className="btn btn-outline-primary btn-lg w-100 mt-4">{data.textButton}</button>
            </div>
        </div>
    );
}

CardPrices.propTypes = {
    data: PropTypes.shape({
        titulo: PropTypes.string.isRequired,
        icono: PropTypes.string.isRequired,        
        precio: PropTypes.string.isRequired, 
        textButton: PropTypes.string.isRequired, 
        features: PropTypes.arrayOf(              
            PropTypes.string.isRequired             
        ).isRequired,
    }).isRequired,  
};

export function Prices(){
    return (
        <div className="my-8 d-flex justify-content-between">
              {datos.prices.map((item, index)=>
                     <CardPrices data={item} key={index}></CardPrices>         
                )}
        </div>
    );
}