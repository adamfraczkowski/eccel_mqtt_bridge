
function getTagType(typeCode) {
    switch (typeCode) {
      case 0x01:
        return "Mifare Ultralight";
      case 0x02:
        return "Mifare Ultralight-C";
      case 0x03:
        return "Mifare Classic";
      case 0x04:
        return "Mifare Classic 1k";
      case 0x05:
        return "Mifare Classic 4k";
      case 0x06:
        return "Mifare Plus";
      case 0x07:
        return "Mifare Plus 2k";
      case 0x08:
        return "Mifare Plus 4k";
      case 0x09:
        return "Mifare Plus 2k sl2";
      case 0x0A:
        return "Mifare Plus 4k sl2";
      case 0x0B:
        return "Mifare Plus 2k sl3";
      case 0x0C:
        return "Mifare Plus 4k sl3";
      case 0x0D:
        return "Mifare Desfire";
      case 0x0F:
        return "JCOP";
      case 0x10:
        return "Mifare Mini";
      case 0x21:
        return "ICODE Sli";
      case 0x22:
        return "ICODE Sli-S";
      case 0x23:
        return "ICODE Sli-L";
      case 0x24:
        return "ICODE Slix";
      case 0x25:
        return "ICODE Slix-S";
      case 0x26:
        return "ICODE Slix-X";
      case 0x27:
        return "ICODE Slix2";
      case 0x28:
        return "ICODE DNA";
      case 0x42:
        return "BLE device UID";
      case 0x50:
        return "BLE PIN";
      default:
        return "Unknown type";
    }
  }
  
  export default getTagType
  