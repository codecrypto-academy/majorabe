import { Footer } from "./Footer";
import { Header } from "./Header";
import { Carrusel } from "./Carrusel";
import { Prices } from "./Prices";

export function Home(){
    return <div className="container">
        <Header></Header>
        <Carrusel></Carrusel>
        <Prices></Prices>
        <Footer></Footer>
        </div>
}
