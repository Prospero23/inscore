import { libmusicxml } from "./lib/libmusicxml";
import { GuidoEngine } from "./guidoengine";
import { INScoreObject } from "./lib/libINScore";
import { JSGMNView } from "./JSGMNView";
import type { JSObjectView } from "./JSObjectView";

export class JSXMLView extends JSGMNView {

	private fXMLLib: libmusicxml | null;

	constructor(parent: JSObjectView, xmllib: libmusicxml | null, guido: GuidoEngine | null) {
		super(parent, guido);
		this.fXMLLib = xmllib;
	}
	clone (parent: JSObjectView) : JSObjectView { return new JSXMLView(parent, this.fXMLLib, this.guido()); }

	toString() : string		    	{ return "JSXMLView"; }

	checkxml() { 
		if (this.fXMLLib) return true;
		console.log ("libMusicXML is not available");
		return false;
	}
	
	xml2gmn (obj: INScoreObject, content: string, page: number) : boolean
	{
		if (!this.fXMLLib) return false;
		let gmn = this.fXMLLib.string2guido (content, true);
		return gmn.length ? this.gmn2svg (obj, gmn, page) : false;
	}

	updateSpecial(obj: INScoreObject)	: boolean {
		if (this.checkxml()) {
			let xml = obj.getXMLInfos();
			return this.xml2gmn (obj, xml.code, xml.page);
		}
		return false;
    }
}
