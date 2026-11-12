import { INScoreObject } from "./lib/libINScore";
export interface GraphicSyncManager {
	updateSync(obj: INScoreObject): boolean;
	clean() : void;
}
