
/* Creado por   :   Keyvin Duque
 * Equipo       :   airChat Team
 * Involucrados :   Jonathan Méndez, Alejandro Almarza
 * Licencia     :   GNU GPL v3
 * Fecha        :   lun 30 dic 2013 23:43:12 VET 
 * Descripcion  :   Instanciador del servidor
 */

var http    = require('http');
var fs      = require('fs');
var path    = require('path');
var mime    = require('mime');
var cache   = {};

function enviar404(response){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Oops error404: recurso no encontrado.');
    response.end();
}

function enviarArchivo(response, rutaArchivo, contenidoArchivo){
    response.writeHead(200, 
        {'content-type': mime.lookup(path.basename(rutaArchivo))}
    );
    response.end(contenidoArchivo);
}

function serveStatic(response, cache, rutaAbs){
    if(cache[rutaAbs]){
        enviarArchivo(response, rutaAbs, cache[rutaAbs]);
    } else {
        fs.exists(rutaAbs, function(exists){
            if (exists){
                fs.readFile(rutaAbs, function (err, data) {
                    if (err) {
                        enviar404(response);
                    } else {
                        cache[rutaAbs] = data;
                        enviarArchivo(response, rutaAbs, data);
                    }
                });
            } else {
                enviar404(response);
            }
        });
    }
}

var server = http.createServer(function(request, response) {
    var rutaArchivo = false;
    if (request.url === '/'){
        rutaArchivo = 'public/index.html';
    } else {
        rutaArchivo = 'public' + request.url;
    }
    
    var rutaAbs = './' + rutaArchivo;
    
    serveStatic(response, cache, rutaAbs);
});

server.listen(8098, function() {
    console.log('Servidor escuchando en el puerto 8098');
});

var chatServer = require('./lib/chat_server.js');
chatServer.listen(server);
