const serialport = require("serialport");

function pythonREPL(args) {
    var repl = {}; // The object representing the REPL.
    repl.args = args; // Argumnets define various settings and references.
    repl.io = null; // Represents the input/output (IO) of the REPL.
    repl.connectionId = -1; // Identifies the connection to the micro:bit REPL.
    repl.port123 = null
    // Setup the REPL connection with the micro:bit.
    repl.run = async function () {
        this.io = this.args.io.push();
        this.io.onVTKeystroke = this.sendString.bind(this, true);
        this.io.sendString = this.sendString.bind(this, false);
        this.io.println("MicroPython REPL for the BBC micro:bit.");
        var self = this; // inner reference for when JS this changes.
        // Try to find the micro:bit device as a USB serial connection.
        var eligiblePorts = await getlist();
        let foundMicrobit = false;
        if (eligiblePorts.length > 0) {
            // Look through the discovered devices and identify the micro:bit by its
            // productId and vendorId.
            eligiblePorts.forEach(function (portNames) {
                let productId = parseInt(portNames.productId, 16)
                let vendorId = parseInt(portNames.vendorId, 16)
                if (productId === 516 && vendorId === 3368) {
                    // Device found!
                    foundMicrobit = true;
                    console.log('BBC micro:bit discovered. Making connection...');
                    // Make a connection to the micro:bit.
                    try{
                        repl.port123 = new serialport(portNames.comName, {
                            baudRate: 115200
                        });
                    }catch(err) {
                        self.io.println("BBC micro:bit access denied! Please check ");
                    }
                    
                }
            });
            self.io.println("Connected: type 'help()' for more information.");
            self.io.print('>>> ');
            self.connectionId = repl.port123.connectionId;
            // When the window closes, disconnect the device.
            /* window.addEventListener('close', function() {
                chrome.serial.disconnect(self.connectedId, function() {});
            });*/
            // When the program gets data from the micro:bit print it!
            repl.port123.on('data', function (info) {
                if (info) {
                    self.io.print(converter.bufferToString(info));
                }
            });

            repl.port123.on('error', function (err) {
                self.io.print(err);
            })

        }
        // No micro:bit found, so show something useful.
        if (!foundMicrobit) {
            self.io.println('Could not find micro:bit. Plug in device and try again.');
        }

    };

    // Send a string to the REPL running on the BBC micro:bit.
    repl.sendString = function (fromKeyboard, str) {
        console.log(str)
        repl.port123.write(Buffer.from(str), function (a) {
        });
    };

    // Handle when the REPL session is closed.
    repl.exit = function (code) {
        console.log(code);
    };

    return repl;
}

function getserial(com, btl) {
    return new serialport(com, {
        baudRate: btl
    });
}


const getlist = function () {
    return new Promise((resolve, reject) => {
        serialport.list((err, ports) => {
            if (!err) {
                resolve(ports);
            } else {
                reject(err);
            }
        })
    })
}
// Make the REPL "go".
const go = function () {
    let storage
    try {
        storage = chrome.storage.sync
    } catch (err) {
        storage = localStorage
    }
    hterm.defaultStorage = new lib.Storage.Local(storage);
    var t = new hterm.Terminal("opt_profileName");
    t.decorate(document.querySelector('#terminal'));

    t.onTerminalReady = function () {
        t.runCommandClass(pythonREPL, document.location.hash.substr(1));
        return true;
    };
};

window.onload = function () {
    go()
}

// Run when the REPL window has loaded.x


    

