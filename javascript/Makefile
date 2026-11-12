#################################################################
#
# INScore Javascript Library Makefile
# (c) GRAME-CNCM 2020-2021
#
#################################################################

.PHONY : pages testlib npm check ts

MAKE ?= make
TSC := ./node_modules/.bin/tsc

# location of the typescript sources
TSDIR    := src
GLUEDIR  := glueSrc
# name of the output folder for the 'check' target
CHECKDIR ?= TSCheck

# collect source files
GLUESRC  := $(wildcard $(GLUEDIR)/*.ts) $(TSDIR)/inscoreglue.ts $(TSDIR)/libraries.ts 
LIBSRC   := $(wildcard $(TSDIR)/*.ts)

# check target dependendies
CHECKOUT := $(LIBSRC:$(TSDIR)/%.ts=$(CHECKDIR)/%.js)

# external typescript libraries location
TSLIB    := $(TSDIR)/lib
# grame required modules
MODULES     := node_modules/@grame

GUIDO       := $(MODULES)/guidolib
GUIDOLIB    := lib/libGUIDOEngine.js lib/libGUIDOEngine.wasm
GUIDOMODULE := $(GUIDOLIB:lib/%=$(GUIDO)/%)

MXML        := $(MODULES)/libmusicxml
XMLLIB      := lib/libmusicxml.js lib/libmusicxml.wasm $(TSLIB)/libmusicxml.d.ts $(TSLIB)/libmusicxml.ts
XMLMODULE   := $(XMLLIB:lib/%=$(MXML)/%)

FAUST        := $(MODULES)/libfaust
FAUSTLIB     := lib/libfaust-wasm.js lib/libfaust-wasm.wasm lib/libfaust-wasm.data lib/FaustLibrary.js

# inscore wasm library location and output files
WASMDIR      := ../build/lib
INSCOREWASM  := lib/libINScore.js lib/libINScore.wasm

# output libraries names
LIB  := inscoreview.js
GLUE := inscoreglue.js

# npm settings
NPMDIR  := npm
NPMLIB  := INScoreJS.js
NPMDEV  := $(NPMDIR)/dev

#===============================================================
# default target: build everything (including wasm library)
#===============================================================
all : node_modules
	$(MAKE) ts
	$(MAKE) wasm
	$(MAKE) pages

test:
	@echo CHECKOUT $(CHECKOUT)

help : node_modules
	@echo "INScore Javascript library makefile."
	@echo "Available targets are : "
	@echo "  all     : call the ts and wasm tagrgets (default)"
	@echo "  ts      : builds the view and glue libraries"
	@echo "  wasm    : builds the wasm library"
	@echo
	@echo "Project management: "
	@echo "  clean   : remove all outputs"
	@echo "  check   : check typescript code"
	@echo "  cmake   : regenerate the wasm project"
	@echo "  install : install the required npm components"
	@echo "  modules : install the external librairies (called by install target)"
	@echo "  npm     : prepares the $(NPMDIR) folder for publishing to npm "
	@echo "  publish : publish to npm (use with caution)"
	@echo

#===============================================================
# building inscore ts view
#===============================================================
ts: check
	./node_modules/.bin/esbuild inscoreview=src/inscoreglue.ts inscoreglue=glueSrc/basicGlue.ts --bundle --splitting --format=esm --platform=browser --target=es2022 --outdir=.
	
#===============================================================
# building inscore wasm library
#===============================================================
wasm: 
	$(MAKE) -C ../build wasm
	$(MAKE) modules

cmake:
	cd ../build/wasmdir && cmake ..

#===============================================================
# project management
#===============================================================
node_modules:
	$(MAKE) install

install: lib
	npm install
	$(MAKE) modules

lib:
	mkdir lib


#===============================================================
# packaging
#===============================================================
npm: ts $(NPMDIR)/$(NPMLIB) $(NPMDEV)/src $(NPMDIR)/readme.md
	cp src/lib/inscore.d.ts	$(NPMDIR)
	cp lib/libINScore.js lib/libINScore.wasm $(NPMDIR)
	cp $(LIB) $(GLUE) chunk-*.js $(NPMDEV)
	cp glueSrc/*.ts $(NPMDEV)/src
	cp -r fonts $(NPMDIR)
	cp ../src/changelog.txt $(NPMDIR)

$(NPMDEV)/src: 
	mkdir -p $(NPMDEV)/src

$(NPMDIR)/$(NPMLIB): $(GLUESRC) $(LIBSRC) $(wildcard $(TSLIB)/*.ts) tsconfig.json Makefile | check
	./node_modules/.bin/esbuild $(GLUEDIR)/basicGlue.ts --bundle --format=iife --platform=browser --target=es2022 --outfile=$@

$(NPMDIR)/readme.md : IVERSION := $(shell grep '"inscore-version"' $(NPMDIR)/package.json | sed -e 's/[^0-9.]*//g')
$(NPMDIR)/readme.md : $(NPMDIR)/package.json
	sed -e 's/[1-9]\.[0-9]\.[0-9]/$(IVERSION)/' $@ > tmpreadme
	mv tmpreadme $@

publish: VERSION := $(shell grep '"version"' $(NPMDIR)/package.json | sed -e 's/[^0-9.]*//g')
publish: IVERSION := $(shell grep '"inscore-version"' $(NPMDIR)/package.json | sed -e 's/[^0-9.]*//g')
publish: 
	$(MAKE) npm
	@echo "You are about to publish the INScoreJS package v.$(VERSION) on npm."
	@echo "INScore version $(IVERSION)"
	@echo "Make sure you are logged in (npm login)"
	@read -p "Continue [y|n]: " answer && [ $$answer == "y" ]
	cd $(NPMDIR) && npm publish --access public
	@echo "INScoreJS version " $(VERSION) " published"


#===============================================================
# external modules
#===============================================================
modules: $(GUIDOLIB) $(XMLLIB) $(FAUSTLIB) $(INSCOREWASM)

# Preserve the vendor implementation while adapting it for our module build.
$(TSLIB)/libmusicxml.ts   	 : $(MXML)/libmusicxml.ts Makefile
	(printf '%s\n' '// @ts-nocheck' && cat "$<" && printf '\nexport { libmusicxml };\n') > "$@"
$(TSLIB)/libmusicxml.d.ts	 : $(MXML)/libmusicxml.d.ts
	cp $< $@

#===============================================================
# expected modules in lib folder - for testing purpose 
lib/libINScore.js 		: $(WASMDIR)/libINScore.js
	cp $< $@
$(WASMDIR)/libINScore.js:
	$(MAKE) wasm
lib/libINScore.wasm 	: $(WASMDIR)/libINScore.wasm
	cp $< $@
lib/libfaust-wasm.js  	: $(FAUST)/libfaust-wasm.js
	cp $< $@
lib/libfaust-wasm.wasm  : $(FAUST)/libfaust-wasm.wasm
	cp $< $@
lib/FaustLibrary.js 	: $(FAUST)//FaustLibrary.js
	cp $< $@
lib/libfaust-wasm.data  : $(FAUST)/libfaust-wasm.data
	cp $< $@
lib/libGUIDOEngine.js  	: $(GUIDO)/libGUIDOEngine.js
	cp $< $@
lib/libGUIDOEngine.wasm : $(GUIDO)/libGUIDOEngine.wasm
	cp $< $@
lib/libmusicxml.js 		: $(MXML)/libmusicxml.js
	cp $< $@
lib/libmusicxml.wasm 	: $(MXML)/libmusicxml.wasm
	cp $< $@

#===============================================================
# libfaust-wasm.data not found if not along the test pages 
# (should likely be solved on libfaust side) 
pages: pages/libfaust-wasm.data

pages/libfaust-wasm.data:
	cd pages && ln -s ../lib/libfaust-wasm.data .

#===============================================================
# clean removes the output libraries and the check target output
clean : 
	rm -f $(LIB) $(GLUE) $(CHECKOUT)

#===============================================================
# check both source groups using the shared TypeScript configuration
#===============================================================
check:
	$(TSC) --project tsconfig.json
