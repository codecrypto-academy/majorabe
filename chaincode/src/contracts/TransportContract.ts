import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { LoteLeche, EstadoLoteLeche } from '../models/LoteLeche'; 

@Info({title: 'ContratoTransportista', description: 'Gestión del transporte de lotes de leche'})
export class TransportContract extends Contract {

    private readonly PREFIJO_LOTE = 'LOTE_';

    /**
     * Permite a un transportista aceptar la responsabilidad de un lote de leche.
     * El estado del lote debe ser 'EnTransito' antes de ser aceptado.
     * @param ctx El contexto de la transacción.
     * @param idLote El ID único del lote de leche a aceptar.
     */
    @Transaction()
    public async AceptarLote(ctx: Context, idLote: string): Promise<void> {
        const lote = await this.ObtenerLoteInterno(ctx, idLote);
        const idTransportista = this.obtenerIdCliente(ctx).toLowerCase();

        if (lote.idTransportista?.toLowerCase() !== idTransportista) {
            throw new Error(`No estás autorizado para aceptar este lote.`);
        }

        if (lote.estado !== 'AsignadoATransportista') {
            throw new Error(`El lote no está en estado 'AsignadoATransportista'. Estado actual: '${lote.estado}'.`);
        }

        lote.estado = 'EnTransito';
        this.agregarEvento(lote, idTransportista, 'Se acepta la asignación de transporte del lote');
        await ctx.stub.putState(this.PREFIJO_LOTE + idLote, Buffer.from(JSON.stringify(lote)));
    }


    /**
     * Permite a un transportista rechazar un lote de leche.
     * El estado del lote debe ser 'EnTransito'.
     * @param ctx El contexto de la transacción.
     * @param idLote El ID único del lote de leche a rechazar.
        */
    @Transaction()
    public async RechazarLote(ctx: Context, idLote: string): Promise<void> {
        const lote = await this.ObtenerLoteInterno(ctx, idLote);
        const idTransportista = this.obtenerIdCliente(ctx).toLowerCase();

        if (lote.idTransportista?.toLowerCase() !== idTransportista) {
            throw new Error(`No estás autorizado para rechazar este lote.`);
        }

        if (lote.estado !== 'AsignadoATransportista') {
            throw new Error(`Solo se puede rechazar un lote en estado 'AsignadoATransportista'.`);
        }

        lote.estado = 'Producido';
        delete lote.idTransportista;
        this.agregarEvento(lote, idTransportista, 'Se rechaza el trasnporte del lote');

        await ctx.stub.putState(this.PREFIJO_LOTE + idLote, Buffer.from(JSON.stringify(lote)));
    }

    @Transaction()
    public async EntregarAProcesador(ctx: Context, idLote: string, idProcesador: string): Promise<void> {
        const lote = await this.ObtenerLoteInterno(ctx, idLote);
        const idTransportista = this.obtenerIdCliente(ctx).toLowerCase();

        if (lote.idTransportista?.toLowerCase() !== idTransportista) {
            throw new Error(`No estás autorizado para entregar este lote.`);
        }

        if (lote.estado !== 'EnTransito') {
            throw new Error(`El lote debe estar en tránsito para ser entregado. Estado actual: '${lote.estado}'.`);
        }

        lote.estado = 'AsignadoAProcesador';
        lote.idProcesador = idProcesador;
        this.agregarEvento(lote, idTransportista, 'Se asigna lote a Planta Procesadora');

        await ctx.stub.putState(this.PREFIJO_LOTE + idLote, Buffer.from(JSON.stringify(lote)));
    }


    /**
     * Lee los detalles de un lote de leche del ledger.
     * Esta función no modifica el estado del ledger.
     * @param ctx El contexto de la transacción.
     * @param idLote El ID del lote a leer.
     * @returns Los datos del lote en formato JSON string.
     */
    @Transaction(false)
    @Returns('string')
    public async LeerLote(ctx: Context, idLote: string): Promise<string> {
        const lote = await this.ObtenerLoteInterno(ctx, idLote);
        return JSON.stringify(lote);
    }

    /**
     * Lista todos los lotes de leche que están asignados al transportista actual.
     * @param ctx El contexto de la transacción.
     * @returns Una cadena JSON que contiene una lista de lotes.
     */
    @Transaction(false)
    @Returns('string')
    public async QueryMyLotes(ctx: Context): Promise<string> {
    const idTransportista = this.obtenerIdCliente(ctx).toLowerCase();
    console.log("ID del transportista conectado:", idTransportista);

    const iterator = await ctx.stub.getStateByRange('', '');
    const resultados: LoteLeche[] = [];

    let res = await iterator.next();
    while (!res.done) {
        const record = res.value;
        if (record.value && record.value.length > 0) {
        const lote: LoteLeche = JSON.parse(record.value.toString());
        if (
            lote.idTransportista?.toLowerCase() === idTransportista &&
            ['AsignadoATransportista', 'EnTransito', 'AsignadoAProcesador'].includes(lote.estado)
        ) {
            resultados.push(lote);
        }
        }
        res = await iterator.next();
    }

    await iterator.close();
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
     * Función interna para obtener un lote de leche del ledger por su ID.
     * Lanza un error si el lote no existe.
     * @param ctx El contexto de la transacción.
     * @param idLote El ID único del lote de leche.
     * @returns El objeto LoteLeche.
     */
    private async ObtenerLoteInterno(ctx: Context, idLote: string): Promise<LoteLeche> {
        const data = await ctx.stub.getState(this.PREFIJO_LOTE + idLote);
        if (!data || data.length === 0) {
            throw new Error(`El lote con ID '${idLote}' no existe.`);
        }
        return JSON.parse(data.toString()) as LoteLeche;
    }

    /**
     * Función interna para obtener el ID del cliente (transportista) que invoca la transacción.
     * @param ctx El contexto de la transacción.
     * @returns El ID del cliente.
     */
    private obtenerIdCliente(ctx: Context): string {
        const fullId = ctx.clientIdentity.getID();
        const matches = fullId.match(/\/CN=([0-9a-zA-Z]+)::/);
        if (!matches) throw new Error('No se pudo extraer el CN de la identidad');
        return matches[1].toLowerCase();  
    }

    private agregarEvento(lote: LoteLeche, actor: string, accion: string) {
      if (!lote.historial) lote.historial = [];
      lote.historial.push({
        timestamp: new Date().toISOString(),
        actor,
        accion
      });
    }


    @Transaction(false)
    @Returns('string')
    public async Ping(ctx: Context): Promise<string> {
        console.log('>> LLEGÓ PING de TransportContrat');
        return 'TransportContrat en funcionamiento 🚀';
    }
}