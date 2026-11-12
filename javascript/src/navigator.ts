

export var Safari: boolean = false;
export var Explorer: boolean = false;
export var Edge: boolean = false;
var Firefox: boolean = false;
var Chrome: boolean = false;

export var WindowsOS: boolean = false;
var MacOS: boolean = false;
export var UnixOS: boolean = false;
export var AndroidOS: boolean = false;

export function scanNavigator() : void {
	var ua = window.navigator.userAgent;
	Chrome = (ua.indexOf('Chrome') >= 0);
	Safari = (ua.indexOf('Safari') >= 0) && ! Chrome;
	Explorer = (ua.indexOf('MSIE ') >= 0) || (ua.indexOf('Trident') >= 0);
	Edge = (ua.indexOf('Edge') >= 0);
	Firefox = (ua.indexOf('Firefox') >= 0);
}

export function scanPlatform() : void {
	var os = window.navigator.appVersion;
	WindowsOS = (os.indexOf('Win') >= 0);
	MacOS = (os.indexOf('Mac') >= 0) && ! Chrome;
	UnixOS = (os.indexOf('X11') >= 0) || (os.indexOf('Linux') >= 0);
	AndroidOS = (os.indexOf('Android') >= 0);
}
