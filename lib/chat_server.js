
/* Creado por   :   Keyvin Duque
 * Equipo       :   airChat Team
 * Involucrados :   Jonathan Méndez, Alejandro Almarza
 * Licencia     :   GNU GPL v3
 * Fecha        :   lun 30 dic 2013 23:53:34 VET 
 * Descripcion  :   Pruebas con NodeJS para migrar airChat a esta plataforma
 *                  usando WebSockets en vez de HTTP
 */
 
// Variables para el WebSocket
var socketio = require('socket.io');
var io;
var numInvitado = 1;
var nickNames = {};
var nombreUsados = [];
var actualSala = {};
/* Servidor Socket.io permitiendo una sola conexión TCP/IP activa con uso
 * bidireccional y en tiempo real
 */
exports.listen = function(server){
    // Inicio del servidor Socket.io
    io = socketio.listen(server);
    io.set('log level', 1);
    // Definición de como cada conexión de usuario será manejada
    io.sockets.on('connection', function(socket){
        // Se le asigna a un usuario un Número de Invitado
        numInvitado = asignarNumInvitado(socket, numInvitado, nickNames, 
                                            nombreUsados);
        // Se coloca al usuario en la sala de bienvenida
        ingresarSala(socket, 'Bienvenida');
        // Manejo de los mensajes de usuario
        manejoBroadcastMensaje(socket, nickNames);
        // Manejo para el cambio de nombre
        manejoCambioNombre(socket, nickNames, nombreUsados);
        // Manejo para el ingresado de salas
        manejoIngresoSala(socket);
        // Provisiona el usuario con una lista de las salas ocupadas
        socket.on('salas', function () {
            socket.emit('salas', io.sockets.manager.rooms);
        });
        // Limpieza lógica al momento de desconectarse el usuario
        manejoDesconexionCliente(socket, nickNames, nombreUsados);
    });
};

/* ---------------------- Funciones ----------------------- */

// Función para la asignación de número de invitado
function asignarNumInvitado(socket, numInvitado, nickNames, nombreUsados){
    // Se genera un nuevo id de invitado
    var nombre = 'invitado_' + numInvitado;
    // Se asocia el nickname con el id del socket
    nickNames[socket.id] = nombre;
    // Permite al usuario saber su nombre
    socket.emit('nombreResultado', {
        success: true,
        nombre: nombre
    });
    // Llena el array con los nombres usados
    nombreUsados.push(nombre);
    // Incrementa el contador de invitado
    return numInvitado + 1;
}

// Función para el ingreso de sala

function ingresarSala(socket, sala){
    // Hace que el usuario entre a la sala
    socket.join(sala);
    // Guarda que el usuario esta en tal sala
    actualSala[socket.id] = sala;
    // Hace conocer al usuario que esta en una nueva sala
    socket.emit('ingresoResultado', { sala: sala });
    // Permite hacer conocer a los otros usuarios que un nuevo miembro ingreso
    socket.broadcast.to(sala).emit('mensaje', {
        text: nickNames[socket.id] + ' ha ingresado ' + sala + '.'
    });
    // Determina que otros usuarios estan en la sala
    var usuariosEnSala = io.socket.clients(sala);
    // Si otros existen resume el total de usuarios
    if (usuariosEnSala.length > 1) {
        var usuariosEnSalaSummary = 'Usuarios actualmente en ' + room + ': ';
        for (var index in usuariosEnSala) {
            var usuarioSocketId = usuariosEnSala[sala].id;
            if (usuarioSocketId !== socket.id) {
                if (index > 0) {
                    usuariosEnSalaSummary += ', ';
                }
                usuariosEnSalaSummary += nickNames[usuarioSocketId];
            }
        }
        usuariosEnSalaSummary += '.';
        // Envía un mensaje con el resumen de usuarios en la sala
        socket.emit('mensaje', { text: usuariosEnSalaSummary });
    }
}

function manejoCambioNombre (socket, nickNames, nombreUsados){
    // Escucha activa para cambios de nombre
    socket.on('nuevoNombre', function(nombre) {
        // No permite nickname que empiezen por invitado
        if (nombre.indexOf('invitado') === 0){
            socket.emit('nombreResultado', {
                success: false,
                mensaje: 'Los nombres no pueden empezar con "invitado".'
            });
        } else {
            // Si el nickname no ha sido registrado, se registrará
            if (nombreUsados.indexOf(nombre) === -1){
                var nombreAnterior = nickNames[socket.id];
                var nombreAnteriorIndex = nombreUsados.indexOf(nombreAnterior);
                nombreUsados.push(nombre);
                nickNames[socket.id] = nombre;
                // Eliminar los nombres anteriores para hacerlo disponible
                // a otros usuarios
                delete nombreUsados[nombreAnteriorIndex];
                socket.emit('nombreResultado', {
                    success: true,
                    nombre: nombre
                });
                socket.broadcast.to(actualSala[socket.id]).emit('mensaje', {
                    text: nombreAnterior + ' es ahora conocido como ' + 
                            nombre + '.'
                });
            } else {
                // Envía un error en caso de que el nickname ya este registrado
                socket.emit('nombreResultado', {
                    success:false,
                    mensaje: 'Ese nombre actualmente está en uso.'
                });
            }
        }
    });
}
