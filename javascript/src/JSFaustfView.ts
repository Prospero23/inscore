import { JSFaustView } from "./JSFaustView";
import { TFileLoader } from "./TFileLoader";

export class JSFaustfView extends JSFaustView {

    toString() : string	{ return "JSFaustfView"; }
 
    getCode(code: string) : Promise <string | null>	{ 
  		  return TFileLoader.load (this.getElement(), code);
    }

}
