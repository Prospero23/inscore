import { TMedia } from "./TMedia";
import { INScoreObject } from "./lib/libINScore";
import { AIOScanner } from "./AIOScanner";
import { JSObjectView } from "./JSObjectView";
import { AudioTools } from "./AudioTools";
import type { OShadow } from "./lib/libINScore";

export class JSAudioView extends TMedia {
    fAudio: HTMLAudioElement;
    
    constructor(parent: JSObjectView) {
		let audio = document.createElement('audio');
        super(audio, parent); 
        this.fAudio = audio;
		this.fAudio.preload = "auto";
    }     
	clone (parent: JSObjectView) : JSObjectView { return new JSAudioView(parent); }
	toString() : string			{ return "JSAudioView"; }

	updateSpecial ( obj: INScoreObject)	: boolean {	
        AIOScanner.scan (obj.getOSCAddress());
		this.addHandlers( this.fAudio, obj);
		this.fAudio.src  = obj.getFile();
		this.fAudio.currentTime = 0;
		return this.updateSizeASync (obj);
	}
 
	setShadow(elt: HTMLElement, val: OShadow): void {
		this.fAudio.style.filter = `drop-shadow(${val.color} ${val.xOffset}px ${val.yOffset}px ${val.blur}px)`;
	}

	updateSpecific(obj: INScoreObject)	: void {
		AudioTools.updateConnections (obj.getAudioInfos(), this);
		let media = obj.getMediaInfos();
		if (media.playing) this.fAudio.play();
		else this.fAudio.pause();
		this.fAudio.volume = media.volume;
		if (media.rate >= 0) 	this.fAudio.playbackRate = media.rate;
		if (media.mdate >= 0)	{ 
			let time = media.mdate / 1000;
			this.fAudio.currentTime = time;
		}
	}
}
