import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Entidad, TipoEntidad } from '../models/Entidad';

@Info({
    title: 'ContratoAdministrador',
    description: 'Contrato para la gestión de entidades en la red de trazabilidad'
})
export class AdminContract extends Contract {
    
    constructor() {
        super('AdminContract');
    }

    /**
    Registra una nueva entidad en el ledger, usando la dirección de MetaMask como identificador único.
    Solo puede ser invocado por el Administrador de la red (MSP “Org1MSP”).

    @param ctx
    Contexto de la transacción provisto por Fabric. Incluye:
    - clientIdentity: datos del certificado que firma la transacción.
    - stub: interfaz para leer/escribir en el world state.

    @param id
    Identificador de la entidad. Aquí guardaremos la dirección de MetaMask del usuario,
    de modo que cada perfil quede asociado a su wallet Ethereum.

    @param tipo
    Tipo de entidad (por ejemplo, "Productor", "Transportista", "Distribuidor", etc.).

    @param nombre
    Nombre descriptivo de la entidad (p. ej. "Lechería La Vaca Feliz").

    @param ubicacion
    Ubicación geográfica o área de operación de la entidad.
    Puede resultar útil para filtrar o agrupar entidades según zona.

    @throws Error
    Si quien invoca no pertenece a la MSP Org1MSP.
    Si ya existe una entidad con la misma dirección de MetaMask (id).
        */
    @Transaction()
    public async RegistrarEntidad(
        ctx: Context,
        id: string,
        tipo: TipoEntidad,
        nombre: string,
        ubicacion: string
    ): Promise<void> {
        if (!this.isNetworkAdmin(ctx)) {
        throw new Error('Permiso denegado: Solo el Administrador de la red puede ejecutar esta acción.');
        }

    const exists = await ctx.stub.getState(id);
    if (exists && exists.length > 0) {
    throw new Error(`La entidad '${id}' ya existe.`);
    }

    const entity: Entidad = { id, tipo, nombre, ubicacion, estado: 'Activo' };
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(entity)));
    console.info(`Entidad ${id} registrada con éxito.`);

    }

    /**
    Desactiva una entidad existente en el ledger.
    Solo el administrador de la red puede ejecutar esta función.
    @param ctx El contexto de la transacción.
    @param id El ID de la entidad a desactivar.
    */
    @Transaction()
    public async DesactivarEntidad(ctx: Context, id: string): Promise<void> {
    if (!this.isNetworkAdmin(ctx)) {
    throw new Error('Permiso denegado: Solo el Administrador de la red puede ejecutar esta acción.');
    }

    const dataEntidad = await ctx.stub.getState(id);

    if (!dataEntidad || dataEntidad.length === 0) {
    throw new Error(`La entidad con ID '${id}' no existe.`);
    }

    const entidadExistente: Entidad = JSON.parse(dataEntidad.toString());
    if (entidadExistente.estado === 'Inactivo') {
    throw new Error(`La entidad con ID '${id}' ya se encuentra inactiva.`);
    }

    entidadExistente.estado = 'Inactivo';
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(entidadExistente)));
    console.info(`Entidad ${id} desactivada con éxito.`);

    }

    /**
    Lee los detalles de una entidad del ledger.
    Esta función no modifica el estado del ledger.
    @param ctx El contexto de la transacción.
    @param id El ID de la entidad a leer.
    @returns Los datos de la entidad en formato JSON string.
    */
    @Transaction(false)
    @Returns('string')
    public async LeerEntidad(ctx: Context, id: string): Promise<string> {
    const dataEntidad = await ctx.stub.getState(id);
    if (!dataEntidad || dataEntidad.length === 0) {
    throw new Error(`La entidad '${id}' ya existe.`);
    }
    return dataEntidad.toString();
    }

    /**
    Verifica si una entidad existe en el ledger.
    Esta función no modifica el estado del ledger.
    @param ctx El contexto de la transacción.
    @param id El ID de la entidad a verificar.
    @returns Verdadero si la entidad existe, falso en caso contrario.
    */
    @Transaction(false)
    @Returns('boolean')
    public async ExisteEntidad(ctx: Context, id: string): Promise<boolean> {
    const data = await ctx.stub.getState(id);
    return !!data && data.length > 0;
    }

    /**
    Helper para comprobar si quien invoca pertenece al MSP Org1MSP.
    Se considera Administrador de la red si es parte de Org1MSP.
    */
    private isNetworkAdmin(ctx: Context): boolean {
    return ctx.clientIdentity.getMSPID() === 'Org1MSP';
    }


     /**
   * Devuelve todas las entidades del ledger.
   * @param ctx Contexto de la transacción.
   * @returns Lista de entidades en JSON.
    */
    @Transaction(false)
    @Returns('string')
    public async QueryAllEntidades(ctx: Context): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('', '');
    const results: any[] = [];

    let res = await iterator.next();
    while (!res.done) {
        const record = res.value;
        if (record.value) {
        try {
            const item = JSON.parse(record.value.toString());
            // Validamos si tiene los atributos típicos de una Entidad
            if (
            item.tipo && ['Productor', 'Transportista', 'Procesador'].includes(item.tipo) &&
            item.nombre && item.ubicacion && item.estado
            ) {
            results.push(item);
            }
        } catch (err) {
            console.error(`Error al parsear un item: ${err}`);
        }
        }
        res = await iterator.next();
    }

    await iterator.close();
    return JSON.stringify(results);
    }


    /**
    Método de prueba que no modifica el ledger.
    @param ctx El contexto de la transacción.
    @returns Una cadena indicando el estado del contrato.
    */
    @Transaction(false)
    @Returns('string')
    public async Ping(ctx: Context): Promise<string>{
    console.log('>> LLEGÓ PING a AdminContract');
    return 'AdminContract en funcionamiento 🚀';
    }
}

