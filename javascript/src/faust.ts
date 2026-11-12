declare global {
    var FaustModule: any;

    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

//----------------------------------------------------------------------------
// the faust interface
//----------------------------------------------------------------------------
export class faust {
	private fModule: Faust.FaustModule;
	private fLib!: Faust.LibFaust | null;

    async initialise():Promise<any> { 
        return new Promise( (success: any, failure: any) => {
            FaustModule().then ( (module: any) => {
				this.fModule = module;
				this.fLib = Faust.createLibFaust (module);
                success ( this ); 
            });
		});
	}
	
	version () : string			{ return this.fLib!.version(); }
	module () 					{ return this.fModule; }
	lib () 						{ return this.fLib; }
	compiler() 					{ return Faust.createCompiler (this.fLib!); }
}
