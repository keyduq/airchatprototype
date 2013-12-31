
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