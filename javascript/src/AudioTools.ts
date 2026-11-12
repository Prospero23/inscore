import { OAudioNodeInfos } from "./lib/libINScore"
import { AudioObject } from "./AudioObject";
import { AudioCnxVector } from "./lib/libINScore";
import { JSObjectView } from "./JSObjectView";

export interface cnxFunction { (src: AudioObject, dest: AudioObject, srcchan: number, destchan: number) : boolean };

export class AudioTools {

    static updateConnections(cnx: OAudioNodeInfos, view: JSObjectView) {
        AudioTools.doit(view, cnx.connect, AudioTools.connectSrcDest, "connect");
        AudioTools.doit(view, cnx.disconnect, AudioTools.disconnectSrcDest, "disconnect");
    }

    static connectSrcDest(src: AudioObject, dest: AudioObject, srcchan: number, destchan: number) : boolean {
        if (src && dest) {
            const srcNode = src.getAudioNode();
            const destNode = dest.getAudioNode();
            if (!srcNode || !destNode) return false;
            try {
                if (srcchan || destchan) {
                    let splitter = src.getSplitter();
                    let merger   = dest.getMerger();
                    if (srcchan) {
                        if (!splitter) return false;
                        if (destchan) {
                            if (!merger) return false;
                            splitter.connect(merger, srcchan - 1, destchan - 1);
                        }
                        else splitter.connect(destNode, srcchan - 1);
                    }
                    else {
                        if (!merger) return false;
                        srcNode.connect(merger, srcchan, destchan - 1);
                    }
                }
                else srcNode.connect(destNode);
            }
            catch (error) {
                console.log ("Exception while calling AudioNode connect: " + error);
            }
            return true;
        }
        console.log ("AudioTools error: trying to connect null AudioNode (" + src + " " + dest + ")");
        return false;
    }
    
    static disconnectSrcDest(src: AudioObject, dest: AudioObject, srcchan: number, destchan: number) : boolean {
        if (src && dest) {
            const srcNode = src.getAudioNode();
            const destNode = dest.getAudioNode();
            if (!srcNode || !destNode) return false;
            try {
                if (srcchan || destchan) {
                    let splitter = src.getSplitter();
                    let merger   = dest.getMerger();
                    if (srcchan) {
                        if (!splitter) return false;
                        if (destchan) {
                            if (!merger) return false;
                            splitter.disconnect(merger, srcchan-1, destchan-1);
                        }
                        else splitter.disconnect(destNode, srcchan-1);
                    }
                    else {
                        if (!merger) return false;
                        srcNode.disconnect(merger, srcchan, destchan-1);
                    }
                }
                else srcNode.disconnect(destNode);
            }
            catch (error) {
                console.log ("Exception while calling AudioNode disconnect (", srcchan, destchan, ")", error);
            }
            return true;
        }
        console.log ("AudioTools error: trying to disconnect null AudioNode (" + src + " " + dest + ")");
        return false;
    }

    static doit (view: JSObjectView, list: AudioCnxVector, cnx: cnxFunction, op: string) {
        let n = list.size();
        for (let i = 0; i < n; i++) {
            let cdesc = list.get(i);
            let tmp = JSObjectView.getObjectView(cdesc.objid);
            if (tmp) {
                let dest = tmp.toAudioObject();
                let src = view.toAudioObject();
                if (src && dest) {
                    cnx (src, dest, cdesc.from, cdesc.to);
                }
                else console.log ("AudioTools " + op + " error: not an audio object: " + view + " -> " + tmp);
            }
            else console.log ("AudioTools error: incorrect view received by " + op + " method: " + cdesc.objid);
        }
    }
}
