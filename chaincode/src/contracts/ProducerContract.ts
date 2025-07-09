import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { LoteLeche, EstadoLoteLeche } from '../models/LoteLeche';

@Info({ title: 'ContratoProductor', description: 'Gestión de lotes de leche cruda por parte del productor' })
export class ProducerContract extends Contract {

    private readonly PREFIJO_LOTE = 'LOTE_';

    /**
     * Crea un nuevo lote de leche cruda en el ledger.
     * @param ctx Contexto de la transacción.
     * @param idLote ID único del lote (p.ej. LOTE_ab12cd_1625312345678).
     * @param account Dirección de MetaMask del productor.
     * @param volumenLitros Volumen en litros.
     * @param fechaProduccion Fecha de producción en ISO string.
     */
    @Transaction()
    public async CrearLote(
        ctx: Context,
        idLote: string,
        account: string,
        volumenLitros: number,
        fechaProduccion: string
    ): Promise<void> {
        
        // 1) Autorización: quien firma debe ser ese mismo productor
        const invoker = ctx.clientIdentity.getID();
        if (!invoker.includes(account)) {
            throw new Error('Permiso denegado: solo el productor dueño de la cuenta puede crear su lote.');
        }

        // 2) Validaciones
        const existe = await this.ExisteLote(ctx, idLote);
        if (existe) throw new Error(`El lote '${idLote}' ya existe.`);
        if (isNaN(volumenLitros) || volumenLitros <= 0) {
            throw new Error(`Volumen inválido: ${volumenLitros}.`);
        }

        // 3) Construcción del objeto, usando la dirección pasada
        const nuevo: LoteLeche = {
            id: idLote,
            idProductor: account.toLowerCase(),  
            volumenLitros,
            fechaProduccion,
            estado: 'Producido'
        };
        this.agregarEvento(nuevo, account, 'Se crea el lote de leche');

        // 4) Guardar en ledger
        await ctx.stub.putState(this.PREFIJO_LOTE + idLote, Buffer.from(JSON.stringify(nuevo)));  
        
        console.info(`Lote ${idLote} creado para productor ${account}`);
    }


    /**
     * Envía un lote de leche producido a un transportista.
     * Cambia el estado del lote a 'EnTransito'.
     * @param ctx El contexto de la transacción.
     * @param idLote El ID del lote a enviar.
     * @param idTransportista El ID del transportista al que se envía el lote.
     * @param account cuenta  metamask del productor.
     */
    @Transaction()
    public async EnviarLoteAlTransportista(
    ctx: Context,
    idLote: string,
    idTransportista: string,
    account: string
    ): Promise<void> {
    const lote = await this.obtenerLoteInterno(ctx, idLote);

    if (lote.idProductor?.toLowerCase() !== account.toLowerCase()) {
        throw new Error(`Permiso denegado: No tiene autorización para enviar este lote.`);
    }

    if (lote.estado !== 'Producido') {
        throw new Error(`Solo se pueden enviar lotes en estado 'Producido'. Estado actual: '${lote.estado}'.`);
    }

    lote.estado = 'AsignadoATransportista' as EstadoLoteLeche;
    lote.idTransportista = idTransportista.toLowerCase();
    
    this.agregarEvento(lote, account, 'Se asigna un transportista');

    await ctx.stub.putState(this.PREFIJO_LOTE + idLote, Buffer.from(JSON.stringify(lote)));
    console.info(`Lote ${idLote} asignado a transportista ${idTransportista}.`);
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
        const lote = await this.obtenerLoteInterno(ctx, idLote);
        return JSON.stringify(lote);
    }

    /**
     * Verifica si un lote de leche existe en el ledger.
     * Esta función no modifica el estado del ledger.
     * @param ctx El contexto de la transacción.
     * @param idLote El ID del lote a verificar.
     * @returns Verdadero si el lote existe, falso en caso contrario.
     */
    @Transaction(false)
    @Returns('boolean')
    public async ExisteLote(ctx: Context, idLote: string): Promise<boolean> {
        const data = await ctx.stub.getState(this.PREFIJO_LOTE + idLote);
        return (!!data && data.length > 0);
    }

    /**
     * Devuelve todos los lotes creados por este productor.
     * @param ctx Contexto de la transacción.
     * @param account Dirección del productor (desde MetaMask).
     * @returns Lista de lotes en JSON.
     */
    @Transaction(false)
    @Returns('string')
    public async QueryMyLotes(ctx: Context, account: string): Promise<string> {
        const idProductor = account.toLowerCase();
        const iterator = await ctx.stub.getStateByRange('', '');
        const results: LoteLeche[] = [];
        let res = await iterator.next();
        while (!res.done) {
            const record = res.value;
            const lote: LoteLeche = JSON.parse(record.value.toString());
            if (lote.idProductor?.toLowerCase() === idProductor) {
                results.push(lote);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(results);
    }

    @Transaction(false)
    @Returns('string')
    public async QueryAllLotes(ctx: Context): Promise<string> {
        const iterator = await ctx.stub.getStateByRange('', '');
        const results: LoteLeche[] = [];
        let res = await iterator.next();
        while (!res.done) {
            const record = res.value;
            if (record.value && record.key.startsWith('LOTE_')) {
                const lote: LoteLeche = JSON.parse(record.value.toString());
                results.push(lote);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(results);
    }



   /**
     * Función interna para obtener un lote de leche del ledger por su ID.
     * Lanza un error si el lote no existe.
     * @param ctx El contexto de la transacción.
     * @param idLote El ID único del lote de leche.
     * @returns El objeto LoteLeche.
     */
    private async obtenerLoteInterno(ctx: Context, idLote: string): Promise<LoteLeche> {
        const data = await ctx.stub.getState(this.PREFIJO_LOTE + idLote);
        if (!data || data.length === 0) {
            throw new Error(`El lote con ID '${idLote}' no existe.`);
        }
        return JSON.parse(data.toString()) as LoteLeche;
    }

    /**
     * Función interna para obtener el ID del cliente (productor) que invoca la transacción.
     * @param ctx El contexto de la transacción.
     * @returns El ID del cliente.
     */
    private obtenerIdCliente(ctx: Context): string {
        return ctx.clientIdentity.getID().toLowerCase();
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
        console.log('>> LLEGÓ PING de ProducerContrat');
        return 'ProducerContrat en funcionamiento 🚀';
    }
}