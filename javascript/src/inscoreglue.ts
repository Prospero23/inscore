import { INScore } from "./inscore";
import { inscorelibs } from "./libraries";
import { scanPlatform, scanNavigator } from "./navigator";

// Publish native callbacks before the WASM engine starts.
import "./JSViewFactory";
import "./JSObjectView";
import "./JSSceneView";
import "./JSGMNView";
import "./JSAudioioView";
import "./TMidiSetup";
import "./TConnections";
import "./TAppl";
import "./TJavascript";
import "./download";

export class INScoreGlue {
	private fInscore : INScore;
	private fTimeTask : number = 0;
	private fSorterTask : number = 0;

    constructor() {
		this.fInscore = new INScore;
    }
		
    //------------------------------------------------------------------------
	// initialization
	async start():Promise<any> {
		return new Promise( (success: any, failure: any) => {
			this.fInscore.initialise ().then 
			(() => { 
				this.fInscore.start();
				inscorelibs.initialise().then 
					(() => { 
						this.initialise(); 
						success(this); })
			});
		});
	}

	initialise() : void {
		this.fTimeTask = window.setInterval( () => { this.fInscore.timeTask(); }, this.fInscore.getRate());
		this.fSorterTask = window.setInterval( () => { this.fInscore.sorterTask(); }, 10);
		scanPlatform();
		scanNavigator();
	}
}

export var gGlue = new INScoreGlue();

// default function to show the log window (if any)
// should be overriden by client applications
export function showlog (status: boolean) {}

// glue functions
// should be overriden by client applications
export function showMouse (state: boolean) {}

export function openUrl (url: string) {
	window.open (url);
}

type ShowlogFunction = typeof showlog;
type ShowMouseFunction = typeof showMouse;
type OpenUrlFunction = typeof openUrl;

declare global {
    var showlog: ShowlogFunction;
    var showMouse: ShowMouseFunction;
    var openUrl: OpenUrlFunction;
}

globalThis.showlog = showlog;
globalThis.showMouse = showMouse;
globalThis.openUrl = openUrl;
