import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { ProductoProcesado, EstadoProducto } from '../models/ProductoProcesado'; 

@Info({ title: 'ContratoMinorista', description: 'Gestión de productos en el punto de venta' })
export class RetailContract extends Contract {

    private readonly PREFIJO_PRODUCTO = 'PRODUCTO_';

    /**
     * Registra la recepción de un producto en el punto de venta desde el distribuidor.
     * El estado del producto debe ser 'EnVenta' (AtRetail) antes de la recepción.
     * @param ctx El contexto de la transacción.
     * @param idProducto El ID único del producto a recibir.
     */
    @Transaction()
    public async RecibirProducto(ctx: Context, idProducto: string): Promise<void> {
        const idMinorista = this.obtenerIdCliente(ctx);
        const producto = await this.ObtenerProductoInterno(ctx, idProducto);

        // Validar que el producto ya haya sido enviado 'AtRetail' / 'EnVenta' por el distribuidor
        if (producto.estado !== 'EnVenta') { 
            throw new Error(`El producto con ID '${idProducto}' no está en estado 'EnVenta' para su recepción. Estado actual: '${producto.estado}'.`);
        }

        // Validar que el producto esté destinado a este punto de venta
        if (producto.idDestino !== idMinorista) { 
            throw new Error(`Este producto con ID '${idProducto}' no está destinado a tu punto de venta. Destino: '${producto.idDestino}'.`);
        }

        await ctx.stub.putState(this.PREFIJO_PRODUCTO + idProducto, Buffer.from(JSON.stringify(producto)));
        console.info(`Producto ${idProducto} recibido y disponible en el punto de venta ${idMinorista}.`);
    }

    /**
     * Registra la venta de un producto a un cliente.
     * El estado del producto cambia de 'EnVenta' a 'Vendido'.
     * @param ctx El contexto de la transacción.
     * @param idProducto El ID único del producto a vender.
     */
    @Transaction()
    public async VenderProducto(ctx: Context, idProducto: string): Promise<void> {
        const idMinorista = this.obtenerIdCliente(ctx);
        const producto = await this.ObtenerProductoInterno(ctx, idProducto);

        // Validar que el producto esté bajo la gestión de este punto de venta
        if (producto.idDestino !== idMinorista) { 
            throw new Error(`No tienes permiso para vender este producto. Pertenece al destino: '${producto.idDestino}'.`);
        }

        // Validar el estado actual del producto
        if (producto.estado !== 'EnVenta') { 
            throw new Error(`El producto con ID '${idProducto}' no está disponible para la venta. Estado actual: '${producto.estado}'.`);
        }

        producto.estado = 'Vendido' as EstadoProducto; 

        await ctx.stub.putState(this.PREFIJO_PRODUCTO + idProducto, Buffer.from(JSON.stringify(producto)));
        console.info(`Producto ${idProducto} vendido por el punto de venta ${idMinorista}.`);
    }

    /**
     * Lee la información detallada de un producto del ledger.
     * Esta función no modifica el estado del ledger.
     * @param ctx El contexto de la transacción.
     * @param idProducto El ID del producto a leer.
     * @returns Los datos del producto en formato JSON string.
     */
    @Transaction(false)
    @Returns('string')
    public async LeerProducto(ctx: Context, idProducto: string): Promise<string> {
        const producto = await this.ObtenerProductoInterno(ctx, idProducto);
        return JSON.stringify(producto);
    }

    /**
     * Lista todos los productos que están actualmente en el inventario del punto de venta
     * y disponibles para la venta (estado 'EnVenta').
     * @param ctx El contexto de la transacción.
     * @returns Una cadena JSON que contiene una lista de productos en inventario.
     */
    @Transaction(false)
    @Returns('string')
    public async ListarMiInventario(ctx: Context): Promise<string> {
        const idMinorista = this.obtenerIdCliente(ctx);

        const cadenaConsulta = {
            selector: {
                idDestino: idMinorista, 
                estado: 'EnVenta' as EstadoProducto 
            }
        };

        const resultados = await this.queryConSelector(ctx, JSON.stringify(cadenaConsulta));
        return JSON.stringify(resultados);
    }

    /**
     * Lista todos los productos que han sido vendidos por este punto de venta.
     * @param ctx El contexto de la transacción.
     * @returns Una cadena JSON que contiene una lista de productos vendidos.
     */
    @Transaction(false)
    @Returns('string')
    public async ListarMisVentas(ctx: Context): Promise<string> {
        const idMinorista = this.obtenerIdCliente(ctx);

        const cadenaConsulta = {
            selector: {
                idDestino: idMinorista, 
                estado: 'Vendido' as EstadoProducto 
            }
        };

        const resultados = await this.queryConSelector(ctx, JSON.stringify(cadenaConsulta));
        return JSON.stringify(resultados);
    }

    /**
     * Función auxiliar para ejecutar consultas Rich Query en el ledger.
     * @param ctx El contexto de la transacción.
     * @param queryString La cadena de consulta en formato JSON.
     * @returns Un arreglo de objetos que coinciden con la consulta.
     */
    private async queryConSelector(ctx: Context, queryString: string): Promise<any[]> {
        const results: any[] = [];
        const iterator = await ctx.stub.getQueryResult(queryString);

        let res = await iterator.next();
        while (!res.done) {
            const record = res.value;
            // Asegurarse de que el registro.value no sea nulo antes de parsear
            if (record.value) {
                const data = JSON.parse(record.value.toString());
                results.push(data);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return results;
    }

    /**
     * Función interna para obtener un producto procesado del ledger por su ID.
     * Lanza un error si el producto no existe.
     * @param ctx El contexto de la transacción.
     * @param idProducto El ID único del producto.
     * @returns El objeto ProductoProcesado.
     */
    private async ObtenerProductoInterno(ctx: Context, idProducto: string): Promise<ProductoProcesado> {
        const data = await ctx.stub.getState(this.PREFIJO_PRODUCTO + idProducto);
        if (!data || data.length === 0) {
            throw new Error(`El producto con ID '${idProducto}' no existe.`);
        }
        return JSON.parse(data.toString()) as ProductoProcesado;
    }

    /**
     * Función interna para obtener el ID del cliente (minorista) que invoca la transacción.
     * @param ctx El contexto de la transacción.
     * @returns El ID del cliente.
     */
    private obtenerIdCliente(ctx: Context): string {
        const clientId = ctx.clientIdentity.getID();
        return clientId;
    }

    @Transaction(false)
    @Returns('string')
    public async Ping(ctx: Context): Promise<string> {
        console.log('>> LLEGÓ PING de RetailContrat');
        return 'RetailContrat en funcionamiento 🚀';
    }
}