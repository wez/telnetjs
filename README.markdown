# Telnet.js

A Telnet protocol listener for Node.js, written by Wez Furlong and
licensed under a 3-clause BSD license; see LICENSE.markdown for the full
text.

## Features

 * Listen for multiple telnet clients
 * Supports "TERMINAL TYPE", "NAWS" (Window Size), "NEW ENVIRON",
   "COMPRESS2" (MUD compression using zlib deflate)

## Usage

Install it via NPM:

    npm install wez-telnet

Now use it:

     var telnet = require('wez-telnet');
     var s = new telnet.Server(function (client) {
        // I am the connection callback
        console.log("connected term=%s %dx%d",
          client.term, client.windowSize[0], client.windowSize[1]);

        client.on('data', function (buf) {
          console.log("data:", buf.toString('ascii'));
          client.write("you said " + buf);
        });
        client.on('resize', function (width, height) {
          console.log("resized to %dx%d", width, height);
        });
        client.on('interrupt', function () {
          console.log("INTR!");
          // disconnect on CTRL-C!
          client.end();
        });
        client.on('close', function () {
          console.log("END!");
        });
     });
     s.listen(1337);

## Caveats

 * There is no "urgent" or "out of band" facility in Node, so some
   aspects of telnet interrupt handling are not possible.
 * There is no ECHO or LINE-MODE handling at this time.
 * Some consistency checks throw errors that are not caught and may
   cause the server to exit in the presence of bad input.

## Exports

### Server(connected)

The Server constructor.  Returns a derivative of the TCP Server object
which you may subsequently invoke listen() upon to cause it to listen on
the desired address and port.

Takes a single argument, the connection callback function.  The
connection function has the following prototype:

     function connected(client) {}

When a connection is established, the server will attempt to negotiate
the following telnet options:

 * Terminal Type
 * Window Size
 * Environment
 * Binary mode
 * Compress 2 (MUD Compression Protocol)

Once they have all been tried, the connection callback function will be
invoked.

Client is an instance of a TelnetStream object that represents the
server side of the client connection.

Client "implements" the ReadableStream and WritableStream interfaces.

## TelnetStream

### Property: 'env'

    console.log(client.env.USER);

Telnet streams provide an "env" property that holds the environmental
variables sent by the client.  The client must support the NEW-ENVIRON
telnet option for this to be effective, and clients that do will
typically only send a controlled set of variables by default (such as
USER and DISPLAY).

### Property: 'term'

    console.log(client.term);

The "term" property holds the terminal type sent by the client, if the
client supports the TERMINAL TYPE telnet option.

### Property: 'windowSize'

    console.log("%dx%d", client.windowSize[0], client.windowSize[1]);

Holds the negotiated window size sent by clients that support the NAWS
telnet option.  It is an array containing the width in the zeroth
element and the height in the first element.

### Event: 'close'

    function () {}

The close event is emitted in response to the close event being emitted
on the underlying stream; it indicates that the session is no longer
established.

### Event: 'data'

    function (data) {}

The data event emits a Buffer containing data received from the client.
This may turn into a string if setEncoding() is used, but this has not
been tested at the time of writing.

### Event: 'environment'

    function (environment) {}

This environment event emits a hash of environmental variables that have
been set (or changed).  This will typically only trigger if the client
supports the NEW-ENVIRON telnet option and sends an incremental update.

In most cases, the NEW-ENVIRON option will be negotiated before the
server connect event fires; you can find the set of environmental
variables in client.env in this case.

### Event: 'interrupt'

    function () {}

The interrupt event triggers when the client sents the Interrupt
Processing telnet command.  This is associated with the CTRL-C key by
default, but may not be effective, based on the line editing mode of the
client and the local TTY INTR character assignment.

### Event: 'suspend'

    function () {}

The interrupt event triggers when the client sents the Suspend
Processing telnet command.  This is associated with the CTRL-Z key by
default, but may not be effective, based on the line editing mode of the
client and the local TTY SUSP character assignment.

### Event: 'resize'

    function (width, height) {}

The resize event emits the new dimensions of the client terminal.  This
will fire if the client supports the NAWS (Negotiate About Window Size)
telnet option.

In most cases, this will be negotiated before the server connect event
fires; you can find the dimensions in the array client.windowSize.

### end()
### destroy()
### destroySoon()
### pause()
### resume()
### pipe(dest, opts)
### setEncoding(enc)

Map to the equivalent WritableStream methods of the same names.
Note that neither pipe() nor setEncoding() have been tested at the time
of writing; YMMV.

### write(buffer)
### write(data, encoding)

Sends data to the client, just like WritableStream#write.
The data will be properly encoded and formatted for the telnet stream;
this is handled by the write method so you just send the data you want
the client to receive.

### telnetCommand(dodontwill, command)

Sends a telnet "Interpret As Command" (IAC) sequence to the client.
dodontwill is one of the telnet DONT, DO, WONT, WILL command ids.

command is either a telnet option id (8-bit integer) or an array of
8-bit integers to be used as part of a sub-negotiation.

*If you find that you need this method, chances are that we need to
extend telnet.js; I'd love to hear about that, or better yet, see a pull
request!*


