import { GuidoEngine } from "./guidoengine";
import { INScoreObject } from "./lib/libINScore";
import { JSGMNView } from "./JSGMNView";
import type { JSObjectView } from "./JSObjectView";

export class JSGMNStreamView extends JSGMNView {

	private fStream: GuidoStream | null = null;

	constructor(parent: JSObjectView, guido: GuidoEngine | null) {
		super(parent, guido);
		if (guido)
			this.fStream = guido.openStream();
	}

	clone (parent: JSObjectView) : JSObjectView { return new JSGMNStreamView(parent, this.guido()); }
	delete() : void	{ 
		let guido = this.guido();
		if (guido && this.fStream) guido.closeStream(this.fStream);
		this.fStream = null;
		super.delete();
	}

	toString() : string		    { return "JSGMNStreamView"; }
	string2Ar (obj: INScoreObject, gmn: string) : ARHandler | null {
		let guido = this.guido();
		if (!guido || !this.fParser || !this.fStream) return null;
		return guido.stream2AR(this.fParser, this.fStream);
	}

	updateSpecial(obj: INScoreObject)	: boolean {
		let guido = this.guido();
		if (!guido || !this.fStream) return false;

		let gmn = obj.getGuidoStream();
		if (gmn.reset) guido.resetStream(this.fStream);
		if (gmn.stream.length) guido.writeStream (this.fStream, gmn.stream);
		return super.updateSpecial (obj);
    }

}
