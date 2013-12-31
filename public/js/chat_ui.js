
function divEscapedContentElement(mensaje) {
    return $('<div class="list-group-item"></div>').text(mensaje);
}

function divSystemContentElement(mensaje) {
    return $('<div></div>').html('<i>' + mensaje + '</i>');
}

function aEscapedContentElement(mensaje) {
    return $('<a href="javascript:void(0);" class="list-group-item"></a>').
            text(mensaje);
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
        $("#mensajes").append(divEscapedContentElement('Tú: ' + mensaje));
        $("#mensajes").scrollTop($("#mensajes").prop("scrollHeight"));
    }
    $("#txtMensaje").val("");
}

var socket = io.connect();

$(document).ready(function() {
    var chatApp = new chat(socket);
    socket.on('nombreResultado', function(result) {
        var mensaje;
        if (result.success) {
            mensaje = 'Ahora eres ' + result.nombre + '.';
        } else {
            mensaje = result.mensaje;
        }
        $('#mensajes').append(divSystemContentElement(mensaje));
    });
    
    socket.on('ingresoResultado', function(result) {
        $('#sala').text(result.sala);
        $('#mensajes').append(divSystemContentElement('Sala cambiada.'));
    });
    
    socket.on('mensaje', function (mensaje) {
        var nuevoMensaje = $('<div class="list-group-item"></div>').
                text(mensaje.text);
        $('#mensajes').append(nuevoMensaje);
    });
    
    socket.on('salas', function(salas) {
        $('#sala-lista').empty();
        for(var sala in salas) {
            sala = sala.substring(1, sala.length);
            if (sala !== '') {
                if (sala === $("#sala").text())
                    $('#sala-lista').append(aEscapedContentElement(sala).
                        addClass("active"));
                else
                    $('#sala-lista').append(aEscapedContentElement(sala));
            }
        }
        $('#sala-lista a').click(function() {
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