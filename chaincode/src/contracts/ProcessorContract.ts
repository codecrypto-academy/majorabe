import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { LoteLeche, EstadoLoteLeche, EventoLote } from '../models/LoteLeche';
import { ProductoProcesado, UnidadMedida, EstadoProducto } from '../models/ProductoProcesado';

@Info({ title: 'ContratoProcesador', description: 'Gestión del procesamiento de la leche' })
export class ProcessorContract extends Contract {

  private readonly PREFIJO_LOTE = 'LOTE_';
  private readonly PREFIJO_PRODUCTO = 'PRODUCTO_';

      @Transaction()
    public async AceptarLote(ctx: Context, idLote: string): Promise<void> {
        const lote = await this.obtenerLoteInterno(ctx, idLote);
        const idProcesador = this.obtenerIdCliente(ctx);

        if (lote.idProcesador?.toLowerCase() !== idProcesador) {
            throw new Error(`No estás autorizado para aceptar este lote.`);
        }

        if (lote.estado !== 'AsignadoAProcesador') {
            throw new Error(`Solo se puede aceptar un lote en estado 'AsignadoAProcesador'.`);
        }

        lote.estado = 'Recibido';
        this.agregarEvento(lote, idProcesador, 'Se acepta la entrega del lote para procesamiento');

        await ctx.stub.putState(this.PREFIJO_LOTE + idLote, Buffer.from(JSON.stringify(lote)));
    }

    @Transaction()
    public async RechazarLote(ctx: Context, idLote: string): Promise<void> {
        const lote = await this.obtenerLoteInterno(ctx, idLote);
        const idProcesador = this.obtenerIdCliente(ctx);

        if (lote.idProcesador?.toLowerCase() !== idProcesador) {
            throw new Error(`No estás autorizado para rechazar este lote.`);
        }

        if (lote.estado !== 'AsignadoAProcesador') {
            throw new Error(`Solo se puede rechazar un lote en estado 'AsignadoAProcesador'.`);
        }

        lote.estado = 'EnTransito';
        delete lote.idProcesador;

        this.agregarEvento(lote, idProcesador, 'Se rechaza el lote para procesamiento');

        await ctx.stub.putState(this.PREFIJO_LOTE + idLote, Buffer.from(JSON.stringify(lote)));
    }

  @Transaction()
  public async ProcesarLote(
    ctx: Context,
    idLote: string,
    idProducto: string,
    tipoProducto: string,
    cantidad: number,
    unidadMedida: UnidadMedida,
    fechaProcesamiento: string
  ): Promise<void> {
    const idProcesador = this.obtenerIdCliente(ctx);
    const lote = await this.obtenerLoteInterno(ctx, idLote);

    if (lote.estado !== 'Recibido') {
      throw new Error(`El lote con ID '${idLote}' no está en estado 'Recibido'. Estado actual: '${lote.estado}'.`);
    }

    const unidadesValidas: UnidadMedida[] = ['Litros', 'Kilogramos', 'Unidades'];
    if (!unidadesValidas.includes(unidadMedida)) {
      throw new Error(`Unidad de medida inválida: '${unidadMedida}'.`);
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      throw new Error(`Cantidad inválida: ${cantidad}.`);
    }

    const producto: ProductoProcesado = {
      id: idProducto,
      idLoteOrigen: idLote,
      idProcesador,
      tipoProducto,
      cantidad,
      unidadMedida,
      fechaProcesamiento,
      estado: 'Procesado'
    };

    lote.estado = 'Consumido';
    this.agregarEvento(lote, idProcesador, `Lote procesado como ${tipoProducto} (${cantidad} ${unidadMedida})`);

    await ctx.stub.putState(this.PREFIJO_LOTE + idLote, Buffer.from(JSON.stringify(lote)));
    await ctx.stub.putState(this.PREFIJO_PRODUCTO + idProducto, Buffer.from(JSON.stringify(producto)));
  }

  @Transaction(false)
  @Returns('string')
  public async LeerProducto(ctx: Context, idProducto: string): Promise<string> {
    const datos = await ctx.stub.getState(this.PREFIJO_PRODUCTO + idProducto);
    if (!datos || datos.length === 0) {
      throw new Error(`El producto con ID '${idProducto}' no existe.`);
    }
    return datos.toString();
  }

  @Transaction(false)
  @Returns('string')
  public async LeerLoteOrigen(ctx: Context, idProducto: string): Promise<string> {
    const datosProducto = await ctx.stub.getState(this.PREFIJO_PRODUCTO + idProducto);
    if (!datosProducto || datosProducto.length === 0) {
      throw new Error(`El producto con ID '${idProducto}' no existe.`);
    }

    const producto = JSON.parse(datosProducto.toString()) as ProductoProcesado;
    const datosLote = await ctx.stub.getState(this.PREFIJO_LOTE + producto.idLoteOrigen);

    if (!datosLote || datosLote.length === 0) {
      throw new Error(`El lote de origen con ID '${producto.idLoteOrigen}' no existe.`);
    }

    return datosLote.toString();
  }

  @Transaction(false)
  @Returns('string')
  public async QueryMyLotes(ctx: Context): Promise<string> {
    const idProcesador = this.obtenerIdCliente(ctx);
    const iterator = await ctx.stub.getStateByRange('', '');
    const resultados: LoteLeche[] = [];

    let res = await iterator.next();
    while (!res.done) {
      const record = res.value;
      if (record.value && record.value.length > 0) {
        const lote: LoteLeche = JSON.parse(record.value.toString());
        if (
          lote.idProcesador?.toLowerCase() === idProcesador &&
          ['AsignadoAProcesador', 'Recibido'].includes(lote.estado)
        ) {
          resultados.push(lote);
        }
      }
      res = await iterator.next();
    }

    await iterator.close();
    return JSON.stringify(resultados);
  }

  @Transaction(false)
  @Returns('string')
  public async ListarMisProductos(ctx: Context): Promise<string> {
    const idProcesador = this.obtenerIdCliente(ctx);
    const iterator = await ctx.stub.getStateByRange('', '');
    const productos: ProductoProcesado[] = [];

    let res = await iterator.next();
    while (!res.done) {
      const record = res.value;
      if (record.key.startsWith(this.PREFIJO_PRODUCTO)) {
        const producto: ProductoProcesado = JSON.parse(record.value.toString());
        if (producto.idProcesador?.toLowerCase() === idProcesador) {
          productos.push(producto);
        }
      }
      res = await iterator.next();
    }

    await iterator.close();
    return JSON.stringify(productos);
  }

  private async obtenerLoteInterno(ctx: Context, idLote: string): Promise<LoteLeche> {
    const datos = await ctx.stub.getState(this.PREFIJO_LOTE + idLote);
    if (!datos || datos.length === 0) {
      throw new Error(`El lote con ID '${idLote}' no existe.`);
    }
    return JSON.parse(datos.toString()) as LoteLeche;
  }

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
    console.log('>> LLEGÓ PING a ProcessorContract');
    return 'ProcessorContract en funcionamiento 🚀';
  }
}
