import { GlobalConstants } from "./global-constants";

export class Utils {
    public static getTimer(interval: number)  {
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(interval / (1000 * 60 * 60 * 24));
        var hours = Math.floor((interval % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((interval % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((interval % (1000 * 60)) / 1000);

        return ((days) ? days + "d " : '') 
        + ((days > 0 || hours > 0) ? hours + "h " : '') 
        + ((days > 0 || hours > 0 || minutes > 0) ? minutes + "m " : '') 
        + ((seconds > 0) ? seconds + "s" : '00s') ;
    }

    public static addCategory(prize: number): number {
        if (prize <= 30) return 1;
        else if (30 < prize && prize < 100) return 2;
        else if (100 <= prize && prize < 500) return 3;
        else if (500 <= prize && prize < 1000) return 4;
        else return 5;
    }

    public static addCountDown(cat: number): number {
        switch (cat) {
            case 1 : return GlobalConstants.ONE_WEEK;break;
            case 2 : return GlobalConstants.TWO_WEEKS;break;
            case 3 : return GlobalConstants.THREE_MONTHS;break;
            case 4 : return GlobalConstants.SIX_MONTHS;break;
            case 5 : return GlobalConstants.ONE_YEAR;break;
        }
    }
      
    public static getColor(iteration, maxitem) {
        var phase = 0;
        var center = 128;
        var width = 127;
        var frequency = Math.PI*2/maxitem;

        function byte2Hex(n) {
            var nybHexString = "0123456789ABCDEF";
            return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
          }

        function RGB2Color(r,g,b) {
            return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
          }
        
        const red   = Math.sin(frequency*iteration+2+phase) * width + center;
        const green = Math.sin(frequency*iteration+0+phase) * width + center;
        const blue  = Math.sin(frequency*iteration+4+phase) * width + center;
        
        return RGB2Color(red,green,blue);
    }
}