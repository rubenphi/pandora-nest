import { Entidades } from "src/modules/ability/ability.system";

export function validateEquality(id: number, object: any, field: string){
   
   //esta función permite buscar indices escritos en formato string que es recibido a través
   //de la variable field
    function byString(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); 
        s = s.replace(/^\./, '');           
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }
      //esto compara si el id ingresado es igual al id a comparar
       return byString(object,field) == id 
      }





