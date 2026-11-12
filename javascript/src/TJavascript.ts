export class TJavascript {

	static run (script: string ) : number {
	try {
		let out = window.eval (script);
		if (out) {
			if (typeof out === 'string') {
				if (inscore === null) return 0;
				inscore.loadInscore (out);
			}
			else if (Array.isArray(out)) {
				if (inscore === null) return 0;
				let outsum = "";
				out.forEach ( (value) => outsum += value);
				inscore.loadInscore (outsum);
			}
			else {
				console.log ("Unexpected value returned by " + script + ": " + out);
				return 0;
			}
		}
		return 1;
	}
	catch (e) {
		console.log ("Failed to evaluate Javascript code: " + e + "\n" + script);
		return 0;
	}
	}
}

type TJavascriptClass = typeof TJavascript;

declare global {
    var TJavascript: TJavascriptClass;
}

globalThis.TJavascript = TJavascript;
