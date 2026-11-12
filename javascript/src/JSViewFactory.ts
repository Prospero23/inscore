import { inscorelibs } from "./libraries";
import { JSObjectView } from "./JSObjectView";
import { JSTextView } from "./JSTextView";
import { JSTextfView } from "./JSTextfView";
import { JSHtmlView } from "./JSHtmlView";
import { JSHtmlfView } from "./JSHtmlfView";
import { JSSceneView } from "./JSSceneView";
import { JSRectView } from "./JSRectView";
import { JSEllipseView } from "./JSEllipseView";
import { JSLineView } from "./JSLineView";
import { JSImageView } from "./JSImageView";
import { JSArcView } from "./JSArcView";
import { JSPolygonView } from "./JSPolygonView";
import { JSCurveView } from "./JSCurveView";
import { JSGMNView } from "./JSGMNView";
import { JSGMNfView } from "./JSGMNfView";
import { JSGMNStreamView } from "./JSGMNStreamView";
import { JSXMLView } from "./JSXMLView";
import { JSXMLfView } from "./JSXMLfView";
import { JSSVGView } from "./JSSVGView";
import { JSPianoRollView } from "./JSPianorollView";
import { JSPianoRollfView } from "./JSPianorollfView";
import { JSLayerView } from "./JSLayerView";
import { JSSVGfView } from "./JSSVGfView";
import { JSVideoView } from "./JSVideoView";
import { JSAudioView } from "./JSAudioView";
import { JSAudioioView } from "./JSAudioioView";
import { JSFaustView } from "./JSFaustView";
import { JSFaustfView } from "./JSFaustfView";
import { JSFaustwView } from "./JSFaustwView";
import { TSyncManager } from "./TSyncManager";

//----------------------------------------------------------------------------
export class JSViewFactory {

	static createScene (id: string, objid: number) : number { 
		const div = document.getElementById(id);
		if (!div) return 0;
		const scene = new JSSceneView(div, objid);
		return scene.getId();
	}


	static create (parentid: number, type: string, objid: number) : number	{ 
		let parent = JSObjectView.getVObject(parentid);
		if (!parent) return 0;
		let view: JSObjectView | null = null;
		switch (type) {
			case "arc": 	  view = new JSArcView(parent); break;
			case "curve":     view = new JSCurveView(parent); break;
			case "ellipse":   view = new JSEllipseView(parent); break; 
			case "gmn":       view = new JSGMNView(parent, inscorelibs.guido()); break;
			case "gmnf":	  view = new JSGMNfView(parent, inscorelibs.guido()); break;
			case "gmnstream": view = new JSGMNStreamView(parent, inscorelibs.guido()); break;
			case "html":	  view = new JSHtmlView(parent); break; 			
			case "htmlf":	  view = new JSHtmlfView(parent); break;
			case "img":  	  view = new JSImageView(parent); break;
			case "layer":	  view = new JSLayerView(parent); break;
			case "line": 	  view = new JSLineView(parent); break; 
			case "musicxml":  view = new JSXMLView(parent, inscorelibs.xmllib(), inscorelibs.guido()); break;
			case "musicxmlf": view = new JSXMLfView(parent, inscorelibs.xmllib(), inscorelibs.guido()); break;
			case "pianoroll": view = new JSPianoRollView(parent, inscorelibs.guido()); break;
			case "pianorollf": view = new JSPianoRollfView(parent, inscorelibs.guido()); break;
			case "polygon":   view = new JSPolygonView(parent); break;
			case "rect":	  view = new JSRectView(parent); break; 
			case "svg":       view = new JSSVGView(parent); break;
			case "svgf": 	  view = new JSSVGfView(parent); break;
			case "txt": 	  view = new JSTextView(parent); break; 			
			case "txtf":	  view = new JSTextfView(parent); break;
			case "video":	  view = new JSVideoView(parent); break;
			case "audio":	  view = new JSAudioView(parent); break;
			case "faust":	  view = new JSFaustView(parent, inscorelibs.faust()); break;
			case "faustf":	  view = new JSFaustfView(parent, inscorelibs.faust()); break;
			case "faustw":	  view = new JSFaustwView(parent, inscorelibs.faust()); break;
			case "audioio":   view = new JSAudioioView(parent); break;

			case "fileWatcher":
			case "graph":
			case "fastgraph":
			case "radialgraph":
			case "grid":
			case "pianorollstream":
			case "memimg":
			case "sig":
			case "signode":
				console.log (type + ": type is not yet supported");
				break; 

			default:
				console.error ("JSViewFactory::create unknown type " + type);
		}
		if (view) {
			view.setSyncManager (new TSyncManager(view));
			return view.getId();
		}
		return 0;
	}
}

var inscorefactory = new JSViewFactory();

type JSViewFactoryClass = typeof JSViewFactory;

declare global {
    var JSViewFactory: JSViewFactoryClass;
}

globalThis.JSViewFactory = JSViewFactory;
