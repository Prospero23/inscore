import { TFileLoader } from "./TFileLoader";
export class TAppl {

	static load (file: string ) {
		TFileLoader.load (document.body, file, "text/plain").then ( (content) => {
			if (content && inscore) {
				if (!inscore.loadInscore (content))
					console.log ("Failed to load ", file );
			}
		});
	}
}

type TApplClass = typeof TAppl;

declare global {
    var TAppl: TApplClass;
}

globalThis.TAppl = TAppl;
