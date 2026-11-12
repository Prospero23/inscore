import { GuidoEngine } from "./guidoengine";
import { libmusicxml } from "./lib/libmusicxml";
import { faust } from "./faust";
class libraries {
	private fGuido  : GuidoEngine | null;
	private fXMLLib : libmusicxml | null;
	private fFaust : faust | null;

	static fGuidoVersion = 0;
	static fXMLVersion = 0;
	static fFaustVersion = 0;

	constructor() {
    	this.fGuido  = new GuidoEngine;
		this.fXMLLib = new libmusicxml;
		this.fFaust = new faust;
    }

	async initialise():Promise<any> { 
		await this.guidoinit();
		await this.xmlinit();
		return this.faustinit();
	}
		

	async guidoinit():Promise<any> { 
		const guido = this.fGuido;
		if (!guido) return;
		return new Promise( (success: any, failure: any) => {
			guido.initialise().then (
				() => { libraries.fGuidoVersion = guido.getFloatVersion();
						console.log("GuidoEngine version " + guido.getVersionStr());
						success(this); },
				() => { this.fGuido = null; success(this); });
		});
	}

	async xmlinit():Promise<any> { 
		const xmllib = this.fXMLLib;
		if (!xmllib) return;
		return new Promise( (success: any, failure: any) => {
			xmllib.initialise().then (
				() => { libraries.fXMLVersion = xmllib.libVersion();
						console.log("libMusicXML version " + xmllib.libVersionStr());
						success(this); },
				() => { this.fXMLLib = null; success(this); });
		});
	}

	async faustinit():Promise<any> { 
		const compiler = this.fFaust;
		if (!compiler) return;
		return new Promise( (success: any, failure: any) => {
			compiler.initialise().then (
				() => { console.log("Faust version " + compiler.version()); success(this); },
				() => { this.fFaust = null; success(this); });
		});
	}

	guido()  : GuidoEngine | null { return this.fGuido; }
	xmllib() : libmusicxml | null { return this.fXMLLib; }
	faust()  : faust | null { return this.fFaust; }
}

export var inscorelibs = new libraries();

export function getGuidoVersion() : number 		{ return libraries.fGuidoVersion; }
export function getMusicXMLVersion() : number 		{ return libraries.fXMLVersion; }
export function getFaustVersion() : number 		{ return libraries.fFaustVersion; }

type GetGuidoVersionFunction = typeof getGuidoVersion;
type GetMusicXMLVersionFunction = typeof getMusicXMLVersion;
type GetFaustVersionFunction = typeof getFaustVersion;

declare global {
    var getGuidoVersion: GetGuidoVersionFunction;
    var getMusicXMLVersion: GetMusicXMLVersionFunction;
    var getFaustVersion: GetFaustVersionFunction;
}

globalThis.getGuidoVersion = getGuidoVersion;
globalThis.getMusicXMLVersion = getMusicXMLVersion;
globalThis.getFaustVersion = getFaustVersion;
