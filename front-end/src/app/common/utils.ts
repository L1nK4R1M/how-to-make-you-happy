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
        else if (30 < prize && prize <= 100) return 2;
        else if (100 < prize && prize <= 250) return 3;
        else if (250 < prize && prize <= 500) return 4;
        else if (500 < prize && prize < 1000) return 5;
        else return 6;
    }

    public static addCountDown(cat: number): number {
        switch (cat) {
            case 1 : return GlobalConstants.ONE_WEEK;break;
            case 2 : return GlobalConstants.TWO_WEEKS;break;
            case 3 : return GlobalConstants.THREE_MONTHS;break;
            case 4 : return GlobalConstants.SIX_MONTHS;break;
            case 5 : 
            case 6 : return GlobalConstants.ONE_YEAR;break;
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

    public static getScoreToDo(prize) {
        if (prize.cost <= 10) {
            return {name: prize.name, score: 300 + prize.cost* 20}  
          }
          else if (prize.cost > 10 && prize.cost <= 50) {
            return {name: prize.name, score: 500 + prize.cost * 10}
          }
          else if (prize.cost > 50 && prize.cost <= 100) {
            return {name: prize.name, score: 700 + prize.cost * 10}
          }
          else if (prize.cost > 100 && prize.cost <= 200) {
            return {name: prize.name, score: 1000 + prize.cost}
          }
          else if (prize.cost > 200 && prize.cost <= 500) {
            return {name: prize.name, score: 2000 + prize.cost}
          }
          else if (prize.cost > 500) {
            return {name: prize.name, score: 3000 + prize.cost}
          }
    }

    public static generateSectors(array, highestPrize) {
      if (highestPrize.category == 1 || highestPrize.category == 2) {
        return array.concat(
          Array.apply(null, Array(array.length * 2)
          .map((a, i )=> ({'label': "Loose"})
        )))
      }
      else if (highestPrize.category == 3) {
        return array.concat(
          Array.apply(null, Array(array.length * (array.length + 3))
          .map((a, i )=> ({'label': "Loose"})
        )))
      }
      else if (highestPrize.category == 4) {
        return array.concat(
          Array.apply(null, Array(array.length * (array.length + 4))
          .map((a, i )=> ({'label': "Loose"})
        )))
      }
      else if (highestPrize.category >= 5) {
        return array.concat(
          Array.apply(null, Array(array.length * (array.length + 6))
          .map((a, i )=> ({'label': "Loose"})
        )))
      }
    }

    public static duplicateElements(array, times) {
      return array.reduce((res, current) => {
          return res.concat(Array(times).fill(current));
      }, []);
    }
}