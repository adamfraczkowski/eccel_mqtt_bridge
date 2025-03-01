function getICODEError(error) {
    switch (error) {
        case 0x01:
          return "The command is not supported, i.e. the request code is not recognized";
        case 0x02:
          return "The command is not recognized, for example: a format error occurred";
        case 0x03:
          return "The command option is not supported";
        case 0x0F:
          return "Error with no information given or a specific error code is not supported";
        case 0x10:
          return "The specified block is not available (doesn't exist)";
        case 0x11:
          return "The specified block is already locked and thus cannot be locked again";
        case 0x12:
          return "The specified block is locked and its content cannot be changed";
        case 0x13:
          return "The specified block was not successfully programmed";
        case 0x14:
          return "The specified block was not successfully locked";
        case 0x15:
          return "The specified block is protected";
        case 0x40:
          return "Generic cryptographic error";
        case 0x81:
          return "The command is not supported, i.e. the request code is not recognized";
        case 0x82:
          return "The command is not recognized, for example: a format error occurred";
        case 0x83:
          return "The command option is not supported";
        case 0x84:
          return "Error with no information given or a specific error code is not supported";
        case 0x85:
          return "The specified block is not available (doesn't exist)";
        case 0x86:
          return "The specified block is already locked and thus cannot be locked again";
        case 0x87:
          return "The specified block is locked and its content cannot be changed";
        case 0x88:
          return "The specified block was not successfully programmed";
        case 0x89:
          return "The specified block was not successfully locked";
        case 0x8A:
          return "The specified block is protected";
        case 0x8B:
          return "Generic cryptographic error";
        default:
          return "Unknown error code";
      }
}


function getDESFIREError(error) {
    switch (error) {
        case 0x80:
          return 'MF DF Response - No changes done to backup files';
        case 0x81:
          return 'MF DF Response - Insufficient NV-Memory';
        case 0x82:
          return 'MF DF Invalid key number specified';
        case 0x83:
          return 'MF DF Current configuration/status does not allow the requested command';
        case 0x84:
          return 'MF DF Requested AID not found on PICC';
        case 0x85:
          return 'MF DF Attempt to read/write data from/to beyond the files/record\'s limits';
        case 0x86:
          return 'MF DF Previous cmd not fully completed. Not all frames were requested or provided by the PCD';
        case 0x87:
          return 'MF DF Num. of applns limited to 28. No additional applications possible';
        case 0x88:
          return 'MF DF File/Application with same number already exists';
        case 0x89:
          return 'MF DF Specified file number does not exist';
        case 0x8A:
          return 'MF DF Crypto error returned by PICC';
        case 0x8B:
          return 'MF DF Parameter value error returned by PICC';
        case 0x8C:
          return 'MF DF DesFire Generic error. Check additional Info';
        case 0x8D:
          return 'MF DF ISO 7816 Generic error. Check Additional Info';
        default:
          return 'Unknown error';
      }
}


function getLayerError(layer) {
        switch (layer) {
          case 0x01:
            return "No reply received, e.g. PICC removal";
          case 0x02:
            return "Wrong CRC or parity detected";
          case 0x03:
            return "A collision occurred";
          case 0x04:
            return "Attempt to write beyond buffer size";
          case 0x05:
            return "Invalid frame format";
          case 0x06:
            return "Received response violates protocol";
          case 0x07:
            return "Authentication error";
          case 0x08:
            return "A Read or Write error occurred in RAM/ROM or Flash";
          case 0x09:
            return "The RC sensors signal over heating";
          case 0x0A:
            return "Error due to RF.";
          case 0x0B:
            return "An error occurred in RC communication";
          case 0x0C:
            return "A length error occurred";
          case 0x0D:
            return "An resource error";
          case 0x0E:
            return "TX Rejected sanely by the counterpart";
          case 0x0F:
            return "RX request Rejected sanely by the counterpart";
          case 0x10:
            return "Error due to External RF";
          case 0x11:
            return "EMVCo EMD Noise Error";
          case 0x12:
            return "Used when HAL ShutDown is called";
          case 0x15:
            return "ICODE";
          case 0x19:
            return "MiFare Desfire";
          case 0x20:
            return "Invalid data parameters supplied (layer id check failed)";
          case 0x21:
            return "Invalid parameter supplied";
          case 0x22:
            return "Reading/Writing a parameter would produce an overflow.";
          case 0x23:
            return "Parameter not supported";
          case 0x24:
            return "Command not supported";
          case 0x25:
            return "Condition of use not satisfied";
          case 0x26:
            return "A key error occurred";
          case 0x7F:
            return "An internal error occurred";
          case 0xF0:
            return "Protocol authorization error. This command is not allowed without protocol authorization (Command 0x12)";
          default:
            return "Unknown error code";
        }
}

function getErrorByStatusCode(layer,error) {
    var error = "";
    var type = "GENERIC";
    switch(layer) {
        case 0x15:
            error = getICODEError(error);
            type = "ICODE";
        break;

        case 0x19:
            error = getDESFIREError(error);
            type = "DESFIRE";
        break;

        default:
            error = getLayerError(layer);
            type = "GENERIC";
        break;
    }
    
    return {
        error:error,
        type:type
    }
}

export default getErrorByStatusCode
