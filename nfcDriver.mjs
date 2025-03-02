import EventEmitter from 'events';
import getErrorByStatusCode from './errorDictonary.mjs';
import getTagType from './tagTypes.mjs';


class NFCDriver {
    
    constructor(commandTimeout = 5000) {
        this.inputStream = new EventEmitter();
        this.currentCommandListener = new EventEmitter();
        this.nfcDataPolling = new EventEmitter();
        this.currentCommandID = undefined;
        this.commandTimeout = commandTimeout;
        this.softwarePollingEnabled = false;
        this.pollingTimeoutHandler = undefined;
    }
    
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    calculateCRC16CCITT(data) {
      let crc = 0xFFFF;
    
      for (let i = 0; i < data.length; i++) {
        crc ^= data[i] << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) === 0x8000) {
            crc = (crc << 1) ^ 0x1021;
          } else {
            crc <<= 1;
          }
        }
      }
      var CRCVal = crc & 0xFFFF;
      var CRCParsed = CRCVal.toString(2).substring(CRCVal.length-16,CRCVal.length);
      CRCParsed = CRCParsed.substring(CRCParsed.length-16,CRCParsed.length)
      var crcHighByte = parseInt(CRCParsed.slice(0,CRCParsed.length-8),2);
      var crcLowByte = parseInt(CRCParsed.slice(CRCParsed.length-8),2);
      return [crcHighByte,crcLowByte];
    }

    prepareHostCommand(cmd,data) {
        var frameSTX = 0xF5;
        var commandLen =  data.length+3;
        var commandLenXor = commandLen ^ 0xFFFF;
        commandLen = commandLen.toString(2).padStart(16,"0");
        var commandLenHighByte =  parseInt(commandLen.slice(0,commandLen.length-8),2);
        var commandLenLowByte = parseInt(commandLen.slice(commandLen.length-8),2);
        commandLenXor = commandLenXor.toString(2).padStart(16,"0");
        var commandLenXorHighByte =  parseInt(commandLenXor.slice(0,commandLenXor.length-8),2);
        var commandLenXorLowByte = parseInt(commandLenXor.slice(commandLenXor.length-8),2);
        commandLen = [commandLenLowByte,commandLenHighByte];
        commandLenXor = [commandLenXorLowByte,commandLenXorHighByte];
        var commandCRC = [0x00,0x00];
        var commandWithoutCRC = [frameSTX].concat(commandLen).concat(commandLenXor).concat([cmd]).concat(data);        
        var crcData = Buffer.from([cmd].concat(data));
        //commandCRC = this.calculateCCITTCRC(crcData);
        commandCRC = this.calculateCRC16CCITT(crcData);
        commandCRC = [commandCRC[1],commandCRC[0]];
        var commandBuffer = commandWithoutCRC.concat(commandCRC);
        return Buffer.from(commandBuffer).toString("hex");
        
     }

    parseResponse(response) {
        var frameSTX = parseInt(response.slice(0,2),16);
        var dataLengthLowByte = parseInt(response.slice(2,4),16);
        var dataLengthHighByte = parseInt(response.slice(4,6),16);   
        var dataLengthXorLowByte = parseInt(response.slice(6,8),16);
        var dataLengthXorHighByte = parseInt(response.slice(8,10),16);
        var dataLength = dataLengthHighByte.toString(2).padStart(8,"0") + dataLengthLowByte.toString(2).padStart(8,"0")
        dataLength = parseInt(dataLength,2);
        var ack = parseInt(response.slice(10,12),16);
        var command = parseInt(response.slice(12,14),16);
        var data = Buffer.from(response.slice(14,14+(dataLength*2-8)),"hex");
        var crcLowByte = parseInt(response.slice(14+(dataLength*2-8),14+(dataLength*2-8)+2),16);
        var crcHighByte = parseInt(response.slice(14+(dataLength*2-8)+2,14+(dataLength*2-8)+4),16);
        //check CRC
        var responseCommand = Buffer.from(response.slice(10,14+(dataLength*2-8)),"hex");
        var commandCRC = this.calculateCRC16CCITT(responseCommand);
        if(commandCRC[0]!=crcHighByte || commandCRC[1] != crcLowByte) {
          
          //throw "Invalid command CRC";
          //console.error("Invalid command CRC");
        }
        var statusObj = {
          "error":"ok",
          "type":"ok"
        }
        if(ack==0xFF) {
          var dataString = data.toString("hex");
          var layerByte = parseInt(dataString.slice(0,2),16);
          var errorByte = parseInt(dataString.slice(2,4),16); 
          statusObj = getErrorByStatusCode(layerByte,errorByte);
        }  
        return {
            command:command,
            data:data,
            ack:ack,
            error:statusObj["error"],
            type:statusObj["type"]
            
        }
    }


    async sendCommand(cmd,data) {
      this.currentCommandID = cmd;
      var commandString = this.prepareHostCommand(cmd,data);
      this.inputStream.emit("data",commandString);
      var commandPromise = new Promise((resolve,reject)=>{
        this.currentCommandListener.once("data",(message)=>{
          resolve(message);
        });
      })

      var timeoutPromise = new Promise((resolve,reject)=>{
          setTimeout(resolve,this.commandTimeout,"timeout");
      });
      var resultData = await Promise.race([commandPromise,timeoutPromise]);
      this.currentCommandListener.removeAllListeners("data");
      if(resultData=="timeout") {
        throw {command:cmd,data:"timeout",type:"timeout",error:"Command timeout occured 0x"+cmd.toString(16),ack:0xFE};
      } 
      if(resultData.ack==0xFF) {
        throw resultData;
      } 
      
      return resultData;
    }
     

    outputStream(message) {
        message = message.toString()
        var response = this.parseResponse(message);
        if(this.currentCommandID==response.command) {
          this.currentCommandListener.emit("data",response);
        }
    }
    
    // High level functions

    async dummyCommand() {
      try {
        var response = await this.sendCommand(0x01,[]);
      } catch(error) {
        console.error("Dummy command execute failed");
        throw error;
      }
    }

    async getTagCount() {
      try {
        var response = await this.sendCommand(0x02,[]);
        return parseInt(response.data[0],10);
      } catch(error) {
        return 0;
      }
    }

    async getTagUID(tagIndex) {
      try {
        var response = await this.sendCommand(0x03,[tagIndex]);
        var respHex = response.data.toString("hex");
        var tagType = getTagType(parseInt(respHex.slice(0,2),16));
        var tagParam = parseInt(respHex.slice(2,4),16);
        var tagUID = respHex.slice(4);
        return {
          type: tagType,
          param: tagParam,
          uid:tagUID
        }
      } catch(error) {
        throw error;
      }
    }

    async setPolling(stop=false) {
      try {
        var pollingStatus = 0x01;
        if(stop==true)  pollingStatus = 0x00;
        var response = await this.sendCommand(0x06,[pollingStatus]);
        return true;
      
      } catch(error) {
        console.error("Cannot set polling command");
        throw error;
      }
    }

    async checkFunction() {

      var cnt = await this.getTagCount();
      if(cnt>0) {
        try {
          var uidResponse = await this.getTagUID(0x00);
          this.nfcDataPolling.emit("data",uidResponse);
        } catch(error) {
          console.log(error);
        }
        
      }
      if(this.softwarePollingEnabled==true) {
        this.pollingTimeoutHandler = setTimeout(this.checkFunction.bind(this),300);
      }
  }

  startNFCRead() {
      if(typeof this.pollingTimeoutHandler !== "undefined"){
          clearTimeout(this.pollingTimeoutHandler);
          this.pollingTimeoutHandler = undefined;
      }
      this.softwarePollingEnabled = true;     
      this.checkFunction();
  }

  stopNFCRead() {
      if(typeof this.pollingTimeoutHandler !== "undefined"){
          clearTimeout(this.pollingTimeoutHandler);
          this.pollingTimeoutHandler = undefined;
      }
      this.softwarePollingEnabled = false;
  }


  async mockData(data) {
    this.nfcDataPolling.emit("data",data);
  }


    async readICODEBlock(blockNumber,blockCount)  {
      try {
        var response = await this.sendCommand(0x93,[blockNumber,blockCount]);
        var respHex = response.data.toString("hex");
        return respHex;
      } catch(error) {
        throw error;
      }
    }

    async writeICODEBlock(blockNumber,blockCount,data) {
      try {
        var response = await this.sendCommand(0x94,[blockNumber,blockCount].concat(data));
        var respHex = response.data.toString("hex");
        return respHex;
      } catch(error) {
        throw error;
      }
    }

   
  
}

export default NFCDriver
