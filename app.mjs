#!/usr/bin/env node


import mqtt from "mqtt";

var mqttClient = undefined;
var serialHandler = undefined;
var nfcHandler = undefined;

const MQTT_HOST = process.env.MQTT_HOST || "mqtt://localhost:1883";
const SERIAL_PORT = process.env.SERIAL_PORT || "/dev/ttyUSB-NFC";
const BAUDRATE = parseInt(process.env.BAUDRATE) || 115200;
const MQTT_COMMAND_TOPIC = process.env.MQTT_COMMAND_TOPIC || "nfc-device/command";
const MQTT_OUTPUT_TOPIC = process.env.MQTT_OUTPUT_TOPIC || "nfc-device/output"

mqttClient = mqtt.connect(MQTT_HOST); 
serialHandler = new SerialPort({ path: SERIAL_PORT, baudRate: BAUDRATE });
nfcHandler = new NFCDriver()

serialHandler.on("data",(data)=>{
    nfcHandler.outputStream(data);
})

serialHandler.on("error",(error)=>{
    console.error(error);
    process.exit(1);
})

nfcHandler.inputStream.on("data",data=>{
    serialHandler.write(data,function(err){
        if(err) {
            console.error(err);
        }
    });
});

nfcDriver.nfcDataPolling.on("data",(tag)=>{
    var tagData = tag;
    tagData["timestamp"] = Math.floor(new Date().getTime() / 1000);
    mqttClient.publish(MQTT_OUTPUT_TOPIC,JSON.stringify(tagData));
});

mqttClient.on('connect', function () {
    console.log("CLIENT CONNECTED TO "+MQTT_HOST);
    mqttClient.subscribe(MQTT_COMMAND_TOPIC, function (err) {
        if (!err) {
            console.log("SUBSCRIBED TO COMMAND TOPIC "+MQTT_COMMAND_TOPIC);
        }
    })
  })
  
mqttClient.on('message', function (topic, message) {    
    message = message.toString();
    switch(message) {
        
        case "start":
            nfcHanlder.startNFCRead();
        break;

        case "stop":
            nfcHandler.stopNFCRead();
        break;

        default:
        break;
    } 
});

mqttClient.on("error",()=>{
    console.error("Cannot connect to mqtt server");
    process.exit(1);
});

process.on('uncaughtException', function(error) {
    console.error(error);
    process.exit(1)
});