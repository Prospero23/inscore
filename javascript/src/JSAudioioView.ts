import { AudioObject, AudioRouting } from "./AudioObject";
import { INScoreObject } from "./lib/libINScore";
import { AIOScanner } from "./AIOScanner";
import { JSObjectView } from "./JSObjectView";
import { AudioTools } from "./AudioTools";
import { INScore } from "./inscore";

export class JSAudioioView extends JSObjectView implements AudioObject {
    fAudioNode : AudioNode | null = null;
    protected fRouter : AudioRouting | null = null;

    constructor(parent: JSObjectView) {
		super(document.createElement('div'), parent); 
    }

	toString() { return "JSAudioioView"; }
	toAudioObject() : AudioObject { return this; }
    getNumInputs() : number     { return this.fAudioNode ? this.fAudioNode.numberOfInputs : 0; } 
    getNumOutputs() : number    { return this.fAudioNode ? this.fAudioNode.numberOfOutputs : 0; }
    getNumChans() : number      { return this.fAudioNode ? this.fAudioNode.channelCount : 0; }
    getAudioNode() : AudioNode | null { return this.fAudioNode; }
    getSplitter() : AudioNode | null  { return this.fRouter?.getSplitter() ?? null; }
    getMerger() : AudioNode | null    { return this.fRouter?.getMerger() ?? null; }

    clone (parent: JSObjectView) : JSObjectView {
        return new JSAudioioView(parent);
    }

    updateSpecific(obj: INScoreObject)	: void {
        if (this.fAudioNode) {
            let cnx = obj.getAudioInfos();
            AudioTools.updateConnections(cnx, this);
        }
    }

    static init (id: number ) {
        let input = JSObjectView.getObjectView(id);
        if (!(input instanceof JSAudioioView)) return;
        let objectId = input.getIObject();
        if (objectId === null) return;
        let obj = INScore.objects().adapter(objectId);
        input.initInput (obj); 
    }

    initInput (obj: INScoreObject) {
        if (obj.getName() != AIOScanner.kInputName) return;
        const audioContext = AIOScanner.fAudioContext;
        if (!audioContext) {
            obj.event("error");
            return;
        }

        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({audio: true, video: false}).then((stream: MediaStream) => {
                this.fAudioNode = audioContext.createMediaStreamSource(stream);
                this.fRouter  = new AudioRouting (this.fAudioNode, this.fAudioNode.channelCount, this.toString());
                AIOScanner.send(obj.getOSCAddress(), 0, this.fAudioNode.channelCount);
                inscore?.postMessageStrStr (obj.getOSCAddress(), "event", "ready");
            })
            .catch(function(err) {
                console.log("Can't get audio input device: " + err);
                obj.event ("error");
            });
        } else {
            console.log("Can't get audio input device: navigator.mediaDevices is not supported");
            obj.event ("error");
        }
    }

    initView (obj: INScoreObject) : boolean {
        let infos = obj.getIOInfos();
        if (infos.inputs && infos.outputs) {
            console.log ("Warning: JSAudioioView created with " + infos.inputs + " inputs and " + infos.outputs + " outputs."  );
        }
        if (infos.inputs )
            this.fAudioNode = AIOScanner.fOutput;
        if (this.fAudioNode) this.fRouter  = new AudioRouting (this.fAudioNode, this.fAudioNode.channelCount, this.toString());
        return true;    
    }
    
    updateSpecial(obj: INScoreObject) : boolean {
        return true;
    }
}

type JSAudioioViewClass = typeof JSAudioioView;

declare global {
    var JSAudioioView: JSAudioioViewClass;
}

globalThis.JSAudioioView = JSAudioioView;
