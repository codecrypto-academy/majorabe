import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { ProductoProcesado, EstadoProducto } from '../models/ProductoProcesado'; 

@Info({ title: 'ContratoDistribuidor', description: 'Gestión de la distribución de productos procesados' })
export class DistributorContract extends Contract {

    private readonly PREFIJO_PRODUCTO = 'PRODUCTO_';

    /**
     * Registra la recepción de un producto procesado por parte del distribuidor.
     * El estado del producto cambia de 'Procesado' a 'EnDistribucion'.
     * @param ctx El contexto de la transacción.
     * @param idProducto El ID único del producto.
     */
    @Transaction()
    public async RecibirProducto(ctx: Context, idProducto: string): Promise<void> {
        const idDistribuidor = this.obtenerIdCliente(ctx);
        const producto = await this.obtenerProducto(ctx, idProducto);

        if (producto.estado !== 'Procesado') {
            throw new Error(`El producto con ID '${idProducto}' no está en estado 'Procesado'. Estado actual: '${producto.estado}'.`);
        }

        producto.estado = 'EnDistribucion' as EstadoProducto; // Aseguramos el tipo
        producto.idDistribuidor = idDistribuidor;

        await ctx.stub.putState(this.PREFIJO_PRODUCTO + idProducto, Buffer.from(JSON.stringify(producto)));
        console.info(`Producto ${idProducto} recibido por el distribuidor ${idDistribuidor}.`);
    }

    /**
     * Envía un producto desde el distribuidor a un punto de venta (minorista).
     * El estado del producto cambia de 'EnDistribucion' a 'EnVenta'.
     * @param ctx El contexto de la transacción.
     * @param idProducto El ID único del producto.
     * @param idDestino El ID del minorista o punto de venta al que se envía el producto.
     */
    @Transaction()
    public async EnviarProductoAMinorista(ctx: Context, idProducto: string, idDestino: string): Promise<void> {
        const idDistribuidor = this.obtenerIdCliente(ctx);
        const producto = await this.obtenerProducto(ctx, idProducto);

        if (producto.idDistribuidor !== idDistribuidor) {
            throw new Error(`No tiene autorización para distribuir este producto. Pertenece al distribuidor: '${producto.idDistribuidor}'.`);
        }

        if (producto.estado !== 'EnDistribucion') {
            throw new Error(`El producto con ID '${idProducto}' no está en estado 'EnDistribucion'. Estado actual: '${producto.estado}'.`);
        }

        producto.estado = 'EnVenta' as EstadoProducto; // Aseguramos el tipo
        producto.idDestino = idDestino;

        await ctx.stub.putState(this.PREFIJO_PRODUCTO + idProducto, Buffer.from(JSON.stringify(producto)));
        console.info(`Producto ${idProducto} enviado al minorista ${idDestino}.`);
    }

    /**
     * Lee los detalles de un producto procesado del ledger.
     * Esta función no modifica el estado del ledger.
     * @param ctx El contexto de la transacción.
     * @param idProducto El ID del producto a leer.
     * @returns Los datos del producto en formato JSON string.
     */
    @Transaction(false)
    @Returns('string')
    public async LeerProducto(ctx: Context, idProducto: string): Promise<string> {
        const producto = await this.obtenerProducto(ctx, idProducto);
        return JSON.stringify(producto);
    }

    /**
     * Lista todos los productos que están actualmente en posesión del distribuidor
     * y en estado 'EnDistribucion'.
     * @param ctx El contexto de la transacción.
     * @returns Una cadena JSON que contiene una lista de productos.
     */
    @Transaction(false)
    @Returns('string')
    public async ListarMisProductos(ctx: Context): Promise<string> {
        const idDistribuidor = this.obtenerIdCliente(ctx);

        // Se construye una consulta Rich Query para buscar productos
        // base de datos CouchDB subyacente para el ledger.
        const cadenaConsulta = {
            selector: {
                idDistribuidor: idDistribuidor,
                estado: 'EnDistribucion' as EstadoProducto
            }
        };

        const resultados = await this.consultarConSelector(ctx, JSON.stringify(cadenaConsulta));
        return JSON.stringify(resultados);
    }

    /**
     * Función interna para ejecutar consultas Rich Query en el ledger.
     * @param ctx El contexto de la transacción.
     * @param queryString La cadena de consulta en formato JSON.
     * @returns Un arreglo de objetos que coinciden con la consulta.
     */
    private async consultarConSelector(ctx: Context, queryString: string): Promise<any[]> {
        const resultados: any[] = [];
        const iterador = await ctx.stub.getQueryResult(queryString);

        let res = await iterador.next();
        while (!res.done) {
            const registro = res.value;
            // Verifica si el registro tiene un valor antes de intentar parsearlo
            if (registro.value) {
                const datos = JSON.parse(registro.value.toString());
                resultados.push(datos);
            }
            res = await iterador.next();
        }
        await iterador.close();
        return resultados;
    }

    /**
     * Función interna para obtener un producto del ledger por su ID.
     * Lanza un error si el producto no existe.
     * @param ctx El contexto de la transacción.
     * @param idProducto El ID único del producto.
     * @returns El objeto ProductoProcesado.
     */
    private async obtenerProducto(ctx: Context, idProducto: string): Promise<ProductoProcesado> {
        const datos = await ctx.stub.getState(this.PREFIJO_PRODUCTO + idProducto);
        if (!datos || datos.length === 0) {
            throw new Error(`El producto con ID '${idProducto}' no existe.`);
        }
        return JSON.parse(datos.toString()) as ProductoProcesado;
    }

    /**
     * Función interna para obtener el ID del cliente (distribuidor) que invoca la transacción.
     * @param ctx El contexto de la transacción.
     * @returns El ID del cliente.
     */
    private obtenerIdCliente(ctx: Context): string {
        return ctx.clientIdentity.getID();
    }

    // Por ejemplo en AdminContract.ts
    @Transaction(false)
    @Returns('string')
    public async Ping(ctx: Context): Promise<string> {
        console.log('>> LLEGÓ PING a DistributorContract');
        return 'DistributorContract en funcionamiento 🚀';
    }
}