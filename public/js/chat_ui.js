
function divEscapedContentElement(mensaje) {
    return $('<div></div>').text(mensaje);
}

function divSystemContentElement(mensaje) {
    return $('<div></div>').html('<i>' + mensaje + '</i>');
}

function procesarIngresoUsuario(chatApp, socket) {
    var mensaje = $("#txtMensaje").val();
    var mensajeSistema;
    
    if (mensaje.charAt(0) === '/') {
        mensajeSistema = chatApp.procesarComando(mensaje);
        if (mensajeSistema) {
            $("#mensaje").append(divSystemContentElement(mensajeSistema));
        }        
    } else {
        chatApp.enviarMensaje($("#sala").text(), mensaje);
        $("#mensajes").append(divEscapedContentElement(mensaje));
        $("#mensajes").scrollTop($("#mensajes").prop("scrollHeight"));
    }
    $("#txtMensaje").val("");
}

var socket = io.connect();

$(document).ready(function() {
    var chatApp = new chat(socket);
    socket.on('resultadoNombre', function(result) {
        var mensaje;
        if (result.success) {
            mensaje = 'Ahora eres ' + result.name + '.';
        } else {
            mensaje = result.message;
        }
        $('#mensajes').append(divSystemContentElement(mensajes));
    });
    
    socket.on('ingresoResultado', function(result) {
        $('#sala').text(result.room);
        $('#mensajes').append(divSystemContentElement('Sala cambiada.'));
    });
    
    socket.on('mensaje', function (message) {
        var newElement = $('<div></div>').text(message.text);
        $('#mensajes').append(newElement);
    });
    
    socket.on('salas', function(salas) {
        $('#sala-lista').empty();
        for(var sala in salas) {
            sala = sala.substring(1, sala.length);
            if (sala !== '') {
            $('#sala-lista').append(divEscapedContentElement(sala));
            }
        }
        $('#sala-lista div').click(function() {
            chatApp.procesarComando('/join ' + $(this).text());
            $('#txtMensaje').focus();
        });
    });
    setInterval(function() {
        socket.emit('salas');
    }, 1000);
    $('#txtMensaje').focus();
    $('#formEnviar').submit(function() {
        procesarIngresoUsuario(chatApp, socket);
        return false;
    });
});