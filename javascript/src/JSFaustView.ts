import { JSSvgBase, type SVGShape } from "./JSSVGBase";
import type { JSObjectView } from "./JSObjectView";
import type { faust } from "./faust";
import { AIOScanner } from "./AIOScanner";
import { AudioTools } from "./AudioTools";
import { AudioRouting, type AudioObject } from "./AudioObject";
import { Download } from "./download";
import type { INScoreObject, OPen } from "./lib/libINScore";

export interface FaustSVG extends SVGSVGElement {
    diagram: Faust.SVGDiagrams;
}

export class JSFaustView extends JSSvgBase implements AudioObject {
    protected fFaust : faust | null;
    protected fFactory: Faust.Factory | null = null;
    protected fEffect: Faust.Factory | null = null;
    protected fMixer: WebAssembly.Module | null = null;
    protected fAudioNode : Faust.FaustMonoNode | Faust.FaustPolyNode | null = null;
    protected fRouter : AudioRouting | null = null;
    protected fVoices = 0;
    protected fCompute = false;
    static fCompilerLock = false;
    static readonly kFailed  = 0;
    static readonly kSuccess = 1;
    static readonly kPending = 2;
    
    constructor(parent: JSObjectView, compiler: faust | null) {
        super(parent);
        this.fFaust = compiler;
    }

    toAudioObject() : AudioObject { return this; }
    getNumInputs() : number     { return this.fAudioNode ? this.fAudioNode.numberOfInputs : 0; }
    getNumOutputs() : number    { return this.fAudioNode ? this.fAudioNode.numberOfOutputs : 0; }
    getNumChans() : number      { return this.fAudioNode ? this.fAudioNode.getNumOutputs() : 0; }
    getAudioNode() : AudioNode | null { return this.fAudioNode; }
    getSplitter() : AudioNode | null  { return this.fRouter?.getSplitter() ?? null; }
    getMerger() : AudioNode | null    { return this.fRouter?.getMerger() ?? null; }

    clone (parent: JSObjectView) : JSObjectView { return new JSFaustView(parent, this.fFaust); }
    toString() : string		                    { return "JSFaustView"; }
    osc2svgname (name: string) : string         { return name.replace (/\//g, "_"); }

    getSVGTarget() : SVGShape   { return this.fSVG; }
	updateSVGDimensions(w: number, h: number) : void { }
	updatePenControl(pen: OPen) : void {	this.updateRegularPen (pen); }

    delete() : void { 
        if (this.fAudioNode) {
            this.fAudioNode.disconnect();
            this.fAudioNode = null;
            this.fRouter = null;
        }
        super.delete();
	}

    error(address: string, msg : string)	: void {
        if (!inscore) return;
        let imsg = inscore.newMessageM ('set');
        inscore.msgAddStr (imsg, 'txt');
        inscore.msgAddStr (imsg, msg);
        inscore.postMessage (address, imsg);
    }

    // Creates the javascript callback to handle user navigation with the generated svg diagram
    makeLinkHandler (name: string, svg: Faust.SVGDiagrams) {
        let FSVG = this.fSVG as FaustSVG;
        this.fSVG.id = name;
        FSVG.diagram = svg;
        globalThis[name + "svg"] = (path: string) => {
            FSVG.innerHTML = FSVG.diagram.getSVG(path);
            let p = FSVG.parentElement;
            if (!p) return;
            let bb = FSVG.getBBox();
            p.style.width = FSVG.style.width = bb.width + "px";
            p.style.height = FSVG.style.height = bb.height + "px";
        };
    }

    dsp2Svg (code: string, name: string) : { svg: string, error: string|null} { 
        if (!this.fFaust) return {svg: "", error: "Faust engine is not available"};
        const lib = this.fFaust.lib();
        if (!lib) return {svg: "", error: "Faust library is not available"};

        let svg = Faust.createSVGDiagrams (lib, name, code, "");
        if (svg.success()) {
            this.makeLinkHandler (name, svg);
            return { svg: svg.getSVG(), error: null };
        }
        return {svg: "", error: "While generating Faust svg diagram :" + svg.error()};
    }

    updateSpecific(obj: INScoreObject)	: void {
        if (this.fAudioNode) {
            AudioTools.updateConnections(obj.getAudioInfos(), this);
            let data = obj.getFaustInfos(true, false);
            let compute = data.compute;
            if (compute != this.fCompute) {
                this.fCompute = compute;
                if (compute) this.fAudioNode.start();
                else this.fAudioNode.stop();
            }
            let val = data.values;
            let n = val.size();
            for (let i=0; i < n; i++) {
                let v = val.get(i);
// console.log ("JSFaustView.updateSpecific setParamValue ", v.address, v.value);
                this.fAudioNode.setParamValue (v.address, v.value);
                if (data.autoOff && (v.type == 0) && v.value && inscore) {  // schedule the button off value
                    let msg = inscore.newMessage();
                    inscore.msgAddF (msg, 0);
                    setTimeout(() => {
                        if (inscore) inscore.postMessage (obj.getOSCAddress() + v.address, msg);
                    }, 50);
                }
            }
            if (this.fVoices) {
                let node = this.fAudioNode as Faust.FaustPolyNode;
                let keys = data.keys;
                n = keys.size();
                for (let i=0; i < n; i++) {
                    let v = keys.get(i);
                    if (v.type == 0)
                        node.keyOn (v.chan, v.pitch, v.vel);
                    else if (v.type == 1)
                        node.keyOff (v.chan, v.pitch, v.vel);
                    else if (v.type == -1)
                        node.allNotesOff (true);
                }
            }
            if (data.wasmExport.length)
                this.downloadWasm (data.wasmExport);
        }
		// else console.log ("Faust audio node is not available");
    }

    async makeFactory (name: string, code: string, voices: number) : Promise<boolean> {
        if (!this.fFaust || !this.fFaust.lib()) return false;
        let compiler = this.fFaust.compiler();
        const args = "-ftz 2";
        if (voices) this.fFactory = await compiler.createPolyDSPFactory (name, code, args);
        else        this.fFactory = await compiler.createMonoDSPFactory (name, code, args);
        return this.fFactory != null;
    }

    async makeNodeFromFactory (factory: Faust.Factory, name: string, voices: number) 
        : Promise<Faust.FaustMonoNode | Faust.FaustPolyNode | null> {
        const audioContext = AIOScanner.fAudioContext;
        if (!audioContext) return null;
        let sp = typeof (window.AudioWorkletNode) == "undefined";
        if (voices) {
            this.fMixer = await Faust.createGenerator().loadDSPMixer("/usr/rsrc/mixer32.wasm");
            if (!this.fMixer) return null;
            return Faust.createPolyFactory().createNode(audioContext, name, factory, this.fMixer, voices, sp, undefined, 1024);
        }
        return Faust.createMonoFactory().createNode (audioContext, name, factory, sp);
    }

    downloadWasm (name: string) : number {
        if (this.fFactory) {
            Download.wasm(name + ".wasm", this.fFactory.code);
            Download.text(name + ".json", this.fFactory.json);
            if (this.fEffect) Download.wasm(name + "_effect.wasm", this.fEffect.code);
            return JSFaustView.kSuccess;
        }
        console.error ("No Faust factory: cannot export wasm module.")
        return JSFaustView.kFailed;
    }

    async makeAudioNode (obj: INScoreObject, name: string, voices: number) : Promise<number> {
        let node = this.fFactory ? await this.makeNodeFromFactory (this.fFactory, name, voices) : null;
        if (this.fAudioNode) this.fAudioNode.disconnect(); 
        this.fAudioNode = node;
        this.fVoices = voices;
        if (!node) {
            let address = obj.getOSCAddress();
            this.error (address, "Cannot compile " + address + ".");
            obj.ready();
            return JSFaustView.kFailed;
        }

 //console.log(this.toString(), "channels:", node.channelCount, this.getNumChans());
        this.fRouter = new AudioRouting (node, this.getNumChans(), this.toString());
        obj.setAudioInOut (node.numberOfInputs ? node.channelCount : 0, node.numberOfOutputs ? node.channelCount : 0);
        let ui = node.getDescriptors();
        ui.forEach ( (elt) => { 
// console.log ("JSFaustView.makeAudioNode elt " + elt.type + " " + elt.label + " " + elt.address + " " + elt.init + " " + elt.min + " " + elt.max + " " + elt.step );
            if ((elt.type == "button") || (elt.type == "checkbox"))
                obj.setFaustUI (elt.type, elt.label, elt.address, 0, 0, 1, 1)
            else
                obj.setFaustUI (elt.type, elt.label, elt.address, elt.init, elt.min, elt.max, elt.step) 
        });
        this.updateSpecific (obj);
        let bb = this.fSVG.getBBox();
        this.updateObjectSize (obj, bb.width + bb.x, bb.height + bb.y);
        obj.ready();
        return JSFaustView.kSuccess;
    }
    
    getCode(code: string) : Promise <string | null>	{ 
        return new Promise( function (resolve) {
            resolve (code);
        })
    }

    async buildNode (obj: INScoreObject, code: string, voices: number) : Promise<number> {
        if (JSFaustView.fCompilerLock) {
            setTimeout ( () => { this.buildNode (obj, code, voices)}, 50);
            return JSFaustView.kPending;
        }
        JSFaustView.fCompilerLock = true;
        const name = obj.getID();
        let done = await this.makeFactory (name, code, voices);
        if (!done) {
            JSFaustView.fCompilerLock = false;
            return JSFaustView.kFailed;
        }
        let result = await this.makeAudioNode (obj, name, voices);
        JSFaustView.fCompilerLock = false;
        setTimeout ( () => { obj.event ("ready") }, 10);
        return result;
    }

    updateSpecial(obj: INScoreObject)	: boolean {
        if (!this.fFaust) {
            console.log ("Faust engine is not available");
            return false;
        }
        AIOScanner.scan (obj.getOSCAddress());
        let data = obj.getFaustInfos (false, true);
        this.getCode (data.code).then ( (code) => {
			if (code) {
                let diagram = this.dsp2Svg(code, this.osc2svgname(obj.getOSCAddress()));
                if (diagram.error)
                    this.error (obj.getOSCAddress(), diagram.error);
                else {
                    // success: display the svg diagram and build the audio node
                    this.fSVG.innerHTML = diagram.svg;
                    this.buildNode (obj, code, data.voices);
                    // this.makeNode (obj, code, data.voices);
                }
                let ret = super.updateSpecial (obj);
                return ret;
            }
            else return false;
        });
        return false;
    }
}
