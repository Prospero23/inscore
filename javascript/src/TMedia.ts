import { AudioObject, AudioRouting } from "./AudioObject";
import { AIOScanner } from "./AIOScanner";
import { INScoreObject } from "./lib/libINScore";
import { JSObjectView } from "./JSObjectView";
import { JSAutoSize } from "./JSAutoSize";

export abstract class TMedia extends JSAutoSize implements AudioObject {
	private fReady : boolean = false;
	private fListen : boolean = false;
	private fAudioNode : AudioNode | null = null;
    protected fRouter : AudioRouting | null = null;

	constructor(elt: HTMLMediaElement, parent: JSObjectView) {
        super(elt, parent);
		AIOScanner.init();
		if (!AIOScanner.fAudioContext) return;
		this.fAudioNode = AIOScanner.fAudioContext.createMediaElementSource(elt);
		this.fAudioNode.connect (AIOScanner.fAudioContext.destination);
		this.fRouter  = new AudioRouting (this.fAudioNode, this.fAudioNode.channelCount, this.toString());
	}

	abstract clone (parent: JSObjectView) : JSObjectView;

	addHandlers (elt: HTMLMediaElement, obj: INScoreObject)	: void {
		if (!this.fListen) {
			elt.addEventListener ("ended", (event) => { this.end(obj); });
			elt.addEventListener ("error", (event) => { this.error(event, obj); });
			elt.addEventListener ("canplay", (event) => { this.ready(obj, elt); });
			this.fListen = true;
		}
		this.fReady = false;
	}

	ready ( obj: INScoreObject, elt: HTMLMediaElement)	: void {
		if (!this.fReady) {
			obj.updateDuration (elt.duration * 1000);
			obj.setAudioInOut (this.getNumInputs(), this.getNumChans());
			obj.ready();
			elt.id = obj.getID();
			// the connect message is intended to sync the model with the existing connection
			if (inscore === null) return;
			inscore.postMessageStrStr (obj.getOSCAddress(), "connect", AIOScanner.kOutputName);
			inscore.postMessageStrStr (obj.getOSCAddress(), "event", "ready");
			// obj.event ("ready");
			this.fReady = true;
		}
	}
	end ( obj: INScoreObject)	: void { obj.event ("end"); }
	error ( event: ErrorEvent, obj: INScoreObject)	: void {
		console.log (obj.getOSCAddress() + ": " + event.message);
		obj.event ("error");
	}

	toAudioObject() : AudioObject { return this; }
	getNumInputs() : number     { return 0; } 
    getNumOutputs() : number    { return this.fAudioNode ? this.fAudioNode.numberOfOutputs : 0; }
    getNumChans() : number      { return this.fAudioNode ? this.fAudioNode.channelCount : 0; }
    getAudioNode() : AudioNode | null { return this.fAudioNode; }
    getSplitter() : AudioNode | null  { return this.fRouter?.getSplitter() ?? null; }
    getMerger() : AudioNode | null    { return this.fRouter?.getMerger() ?? null; }
}
