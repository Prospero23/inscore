/*

  INScore Project

  Copyright (C) 2009,2010  Grame

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

  Grame Research Laboratory, 11 cours de Verdun Gensoul, 69002 Lyon - France
  research@grame.fr

*/

#include "IGuidoStream.h"
#include "IScene.h"
#include "Updater.h"
#include "GUIDOParse.h"
#include "VObjectView.h"

#ifdef EMCC
#include "GuidoStream.h"
#endif

using namespace std;


namespace inscore
{
//--------------------------------------------------------------------------
const string IGuidoStream::kGuidoStreamType("gmnstream");

//--------------------------------------------------------------------------
IGuidoStream::IGuidoStream( const std::string& name, IObject * parent )
	: IGuidoCode (name, parent)
{
	fTypeString = kGuidoStreamType;
#ifdef EMCC
	fGuidoStream = new GuidoStream();
#else
    fGuidoStream = GuidoOpenStream();
#endif
    
	fMsgHandlerMap[kclear_SetMethod] = TMethodMsgHandler<IGuidoStream, void (IGuidoStream::*)()>::create(this, &IGuidoStream::clear);
    fMsgHandlerMap[kwrite_SetMethod] = TMethodMsgHandler<IGuidoStream>::create(this, &IGuidoStream::write);
}

IGuidoStream::~IGuidoStream()
{
#ifdef EMCC
	delete fGuidoStream;
#else
	GuidoCloseStream(fGuidoStream);
#endif
}

//--------------------------------------------------------------------------
const string IGuidoStream::getCleanGMN() const
{
#ifdef EMCC
	return fGuidoStream->getGuidoCode();
#else
	const char* str = GuidoStream2GuidoString(fGuidoStream);
	string r(str);
	GuidoFreeStreamString(str);
	return r;
#endif
}

//--------------------------------------------------------------------------
void IGuidoStream::print (ostream& out) const
{
	IGuidoCode::print(out);
}

//--------------------------------------------------------------------------
void IGuidoStream::accept (Updater* u)
{
	u->updateTo (SIGuidoStream(this));
}

//--------------------------------------------------------------------------
MsgHandler::msgStatus IGuidoStream::set (const IMessage* msg )
{
	MsgHandler::msgStatus status = IObject::set(msg);
	if (status & (MsgHandler::kProcessed + MsgHandler::kProcessedNoChange)) return status; 

    string t;
	if ((msg->size() == 2) && msg->param(1, t)) {
		if(t!=fGMN){
		#ifdef EMCC
			fGuidoStream->ReinitStream();
			fStream.str("");
			fReset = true;
		#else
			GuidoResetStream(fGuidoStream);
		#endif
			writeStream(t);
			status = MsgHandler::kProcessed;
			resetWidth();
			getView()->initView (this);
		}else status = MsgHandler::kProcessedNoChange;
	}
	else status = MsgHandler::kBadParameters;

	return status;
}

//--------------------------------------------------------------------------
void IGuidoStream::clear()
{
#ifndef EMCC
	if(fGMN=="") return;
#endif

#ifdef EMCC
	fGuidoStream->ReinitStream();
	fStream.str("");
	fReset = true;
#else
	GuidoResetStream(fGuidoStream);
#endif
	setGMN("");
	newData(true);
	resetWidth();
	getView()->initView (this);
}


//--------------------------------------------------------------------------
MsgHandler::msgStatus IGuidoStream::write (const IMessage* msg )
{
	MsgHandler::msgStatus status; 

	string t;
	if ((msg->size() == 1) && msg->param(0, t)) {
        status = MsgHandler::kProcessed;
        writeStream(t);
        resetWidth();
        getView()->initView (this);
	}
	else status = MsgHandler::kBadParameters;
	return status;
}

//--------------------------------------------------------------------------
void IGuidoStream::writeStream (std::string t)
{
#ifdef EMCC
	fStream << t;
	fGuidoStream->WriteToStream(t.c_str());
	setGMN(fGuidoStream->getStreamStr());
#else
	const char * newchar = t.c_str();
    GuidoWriteStream(fGuidoStream, newchar);
    const char * str = GuidoGetStream(fGuidoStream);
    setGMN(str);
	GuidoFreeStreamString (str);
#endif
	localMapModified(true);
    newData(true);
}

}
