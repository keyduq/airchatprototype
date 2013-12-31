
// Definicion de la clase chat
var chat = function(socket) {
    this.socket = socket;
};

// Agregado de funcion para enviar mensaje
chat.prototype.enviarMensaje = function (sala, text) {
    var mensaje = {
        sala: sala,
        text: text
    };
    this.socket.emit('mensaje', mensaje);
};

// Agregado de funcion para cambiar de sala
chat.prototype.cambiarSala = function (sala) {
    this.socket.emit('join', {
        nuevaSala: sala
    });
};
// Función para procesar los comandos /nick o /join
chat.prototype.procesarComando = function (comando) {
    var palabras = comando.split(' ');
    var comando = palabras[0]
                    .substring(1, palabras[0].length)
                    .toLowerCase(); // Split para obtener el comando
    var mensaje = false;
    
    switch (comando){
        case 'join':
            palabras.shift();
            var sala = palabras.join(' ');
            this.cambiarSala(sala); //Cambiar o crear sala
            break;
        case 'nick':
            palabras.shift();
            var nombre = palabras.join(' ');
            this.socket.emit('nuevoNombre', nombre); // Cambio de nombre
            break;
        default:
            mensaje = 'Comando no reconocido';  // En caso de que no se
            break;                              // reconozca el comando
    }
    return mensaje;
};