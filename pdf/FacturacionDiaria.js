const currencyFormatter = require('currency-formatter');


exports.facturacionDiario = function (factura) {
    const esCurrencyFormat = new Intl.NumberFormat();
    
    let content = `
        <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Facturacion diaria</title>
                    <style>
                    .text-color {
                        color: #ff9800;
                        font-weight: bolder;
                    }

                    table{
                        width:100%;
                    }
                    </style>
                </head>
                <body>
                    <div id="pageHeader" style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                        <table>
                            <tr>
                                <td>
                                    <font size=4><b>H</b><span class="text-color">y</span><b>M</b><span class="text-color">s</span></font><span><font size=1> Facturación SAS</span></font><br/>
                                    <font size=2>
                                        Datos del vendedor<br/>
                                        <b>${factura.usuario.nombre}</b><br/>
                                        <span>NIT/IDENT: ${factura.usuario.identificacion}</span><br/>
                                        <span>Dir: ${factura.usuario.direccion}</span><br/>
                                        <span>Ciudad: ${factura.usuario.ciudad} Barrio: ${factura.usuario.barrio}</span><br/>
                                        <span>Tel/Cel: ${factura.usuario.numero}</span>
                                    </font>
                                </td>
                                <td>
                                <div align='center'>
                                    <font size=2>
                                        <b>Num: ${factura.numero_factura.valor}</b><br/>
                                        <span>Fecha: ${factura.fecha_inicial_facturacion.valor} - ${factura.fecha_final_facturacion.valor}</span><br/>
                                        <span>Rango: ${factura.rango_inicial_factura.valor} a ${factura.rango_final_factura.valor}</span>
                                    </font>
                                </div>
                                </td>
                                <td>                            
                                    <div align="right">                                
                                        <b>Factura No:</b><font color="red"> ${factura.consecutivo_facturacion.valor}</font><br/>
                                        <font size=2>    
                                            Datos del cliente<br/>
                                            <b>${factura.cliente.nombre}</b><br/>
                                            <span>NIT/IDENTI: ${factura.cliente.identificacion}</span><br/>
                                            <span>Dir: ${factura.cliente.direccion}</span><br/>
                                            <span>Ciudad: ${factura.cliente.ciudad} Barrio: ${factura.cliente.barrio}</span><br/>
                                            <span>Tel/Cel: ${factura.cliente.numero}</span>
                                        </font>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div>
                    <table>
                        <tr>
                            <th align="left">
                                <span>Nombre</span>
                            </th>
                            <th align="right">
                                <span>Iva</span>
                            </th>
                            <th align="right">
                                <span>Descuento</span>
                            </th>
                            <th align="right">
                                <span>Cantidad</span>
                            </th>
                            <th align="right">
                                <span>Val. Unitario</span>
                            </th>
                            <th align="right">
                                <span>Val. Total</span>
                            </th>
                        </tr>`;

        content += factura.detalle.map((fd, i) => (           
                            `<tr key=${i}>
                                <td align="left"><span>${fd.nombre}</span></td>            
                                <td align="right"><span>$${esCurrencyFormat.format(fd.iva)}</span></td>            
                                <td align="right"><span>$${esCurrencyFormat.format(fd.descuento, { code: 'USD' })}</span></td> 
                                <td align="right"><span>${fd.cantidad}</span></td>
                                <td align="right"><span>$${esCurrencyFormat.format(fd.valor_unitario, { code: 'USD' })}</span></td> 
                                <td align="right"><span>$${esCurrencyFormat.format(fd.valor_total, { code: 'USD' })}</span></td>         
                            </tr>`
                        ));

                         

            content += `<tr>
                            <td colspan="5" align="right">Iva:</td>   
                            <td colspan="6" align="right"><b>${currencyFormatter.format(factura.ivaTotal, { code: 'USD' })}</b></td>             
                            </tr>
                            <tr>
                                <td colspan="5" align="right">Descuento:</td>   
                                <td colspan="6" align="right"><b>${currencyFormatter.format(factura.descuentoTotal, { code: 'USD' })}</b></td>             
                            </tr>
                            <tr>
                                <td colspan="5" align="right">Total:</td>   
                                <td colspan="6" align="right"><b>${currencyFormatter.format(factura.total, { code: 'USD' })}</b></td>             
                            </tr>
                        `;

        content +=  `</table>
                    </div>
                    <div id="pageFooter" style="border-top: 1px solid #ddd; padding-top: 5px;">
                        <p style="color: #666; width: 70%; margin: 0; padding-bottom: 5px; text-align: let; font-family: sans-serif; font-size: .65em; float: left;"><a href="https://anartz-mugika.com" target="_blank">https://anartz-mugika.com</a></p>
                        <p style="color: #666; margin: 0; padding-bottom: 5px; text-align: right; font-family: sans-serif; font-size: .65em">Página {{page}} de {{pages}}</p>
                        <span><font size=1><center>${factura.foorter_factura.valor}</center></font></span>
                    </div>
                </body>
            </html>
        `;
        return content;
}

exports.reporteVenta = function (respuesta) {
    const esCurrencyFormat = new Intl.NumberFormat();
    
    let content = `
        <!doctype html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Reporte de Ventas</title>
                    <style>
                    .text-color {
                        color: #ff9800;
                        font-weight: bolder;
                    }

                    table{
                        width:100%;
                        size: 5px;
                    }                    
                    </style>
                </head>
                <body>
                    <div id="pageHeader" style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                        <table>
                            <tr>
                                <td>
                                    <font size=4><b>H</b><span class="text-color">y</span><b>M</b><span class="text-color">s</span></font><span><font size=1> Facturación SAS</span></font><br/>                                    
                                </td>
                                <td>
                                <div align='center'>
                                    
                                        <b>Reporte de Ventas</b><br/>
                                        <span>De: ${respuesta.fechaInicial} al ${respuesta.fechaFinal}</span><br/>
                                  
                                </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div>
                    <table>
                        <tr>
                            <th align="left">
                                <span>Nombre</span>
                            </th>
                            <th align="right">
                                <span>Iva</span>
                            </th>
                            <th align="right">
                                <span>Descuento</span>
                            </th>
                            <th align="right">
                                <span>Cantidad</span>
                            </th>
                            <th align="right">
                                <span>Val. Total</span>
                            </th>
                        </tr>`;

        content += respuesta.object.map((fd, i) => (           
                            `<tr key=${i}>
                                <td align="left"><span>${fd._id}</span></td>            
                                <td align="right"><span>$${esCurrencyFormat.format(fd.iva)}</span></td>            
                                <td align="right"><span>$${esCurrencyFormat.format(fd.descuento, { code: 'USD' })}</span></td> 
                                <td align="right"><span>${fd.cantidad}</span></td>
                                <td align="right"><span>$${esCurrencyFormat.format(fd.valor_total, { code: 'USD' })}</span></td>         
                            </tr>`
                        ));

                         

            content += `<tr>
                            <td colspan="4" align="right">Iva:</td>   
                            <td colspan="5" align="right"><b>${currencyFormatter.format(respuesta.ivaTotal, { code: 'USD' })}</b></td>             
                            </tr>
                            <tr>
                                <td colspan="4" align="right">Descuento:</td>   
                                <td colspan="5" align="right"><b>${currencyFormatter.format(respuesta.descuentoTotal, { code: 'USD' })}</b></td>             
                            </tr>
                            <tr>
                                <td colspan="4" align="right">Total:</td>   
                                <td colspan="5" align="right"><b>${currencyFormatter.format(respuesta.total, { code: 'USD' })}</b></td>             
                            </tr>
                        `;

        content +=  `</table>
                    </div>
                    <div id="pageFooter" style="border-top: 1px solid #ddd; padding-top: 5px;">
                        <p style="color: #666; width: 70%; margin: 0; padding-bottom: 5px; text-align: let; font-family: sans-serif; font-size: .65em; float: left;"><a href="https://anartz-mugika.com" target="_blank">https://anartz-mugika.com</a></p>
                        <p style="color: #666; margin: 0; padding-bottom: 5px; text-align: right; font-family: sans-serif; font-size: .65em">Página {{page}} de {{pages}}</p>
                        <span><font size=1><center>Informe de vetas por rango de fecha: ${respuesta.fechaInicial} al ${respuesta.fechaFinal}, en el se detalla la cantidad 
                            vendida, el iva, descuento y el total de las ventas realizadas.
                        </center></font></span>
                    </div>
                </body>
            </html>
        `;
        return content;
}
