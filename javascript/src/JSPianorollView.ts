import { JSGMNView } from "./JSGMNView";
import type { JSObjectView } from "./JSObjectView";
import { PianoRollType, type GuidoEngine } from "./guidoengine";
import type { INScoreObject, OPianorollInfos } from "./lib/libINScore";

export class JSPianoRollView extends JSGMNView {

	constructor(parent: JSObjectView, guido: GuidoEngine | null) {
		super(parent, guido);
	}
	clone (parent: JSObjectView) : JSObjectView { return new JSPianoRollView(parent, this.guido()); }

	toString() : string		    { return "JSPianoRollView"; }

	proll2svg(obj: INScoreObject, proll: OPianorollInfos, gmn: string)	: boolean {
		let guido = this.guido();
		if (!guido) return false;
		let ar = this.parse (gmn); //(this.getGmn(proll));
		if (ar) {
			let pr = guido.ar2PianoRoll (PianoRollType.kSimplePianoRoll, ar);
			if (!pr) {
				guido.freeAR(ar);
				return false;
			}
			guido.prEnableKeyboard (pr, proll.keyboard);
			guido.prEnableMeasureBars (pr, proll.bars);
			guido.prEnableAutoVoicesColoration (pr, proll.autovoicecolor);
			let l = proll.limits;
			let limits = { 	startDate: {num: l.start.num, denom: l.start.denum }, 
							endDate: {num: l.end.num, denom: l.end.denum }, 
							lowPitch: l.lowpitch, highPitch: l.highpitch };
			guido.prSetLimits( pr, limits );
			let svg = guido.proll2svg (pr, 400, 200);
			this.fSVG.innerHTML = svg;
			guido.destroyPianoRoll(pr);
			guido.freeAR(ar);
			obj.ready();
			return true;
		}
		return false;
	}

	updateSpecial(obj: INScoreObject)	: boolean {
		if (!this.checkGuido()) return false;
		let proll = obj.getPianorollInfos();
		return this.proll2svg (obj, proll, proll.code);
    }
}
