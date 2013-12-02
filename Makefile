# Project name
PROJECT := bitmapper

# URLs for auto-collected resources.
CLOSURE_URL := http://dl.google.com/closure-compiler/compiler-latest.zip
CHROME_EXTERNS_URL := https://closure-compiler.googlecode.com/git/contrib/externs/chrome_extensions.js
QUNIT_EXTERNS_URL := https://raw.github.com/lukeasrodgers/qunit-js-externs/master/qunit-externs.js

# Directory structure.
APPDIR := app
SRCDIR := js
TESTDIR := test
OUTDIR := out
DEBUGDIR := Debug
RELEASEDIR := Release
BUILDDIR := build

# Javascript source files to edit.
APP_SRCS := $(shell find $(APPDIR)/$(SRCDIR) -type f -name '*.js')
TEST_SRCS := $(shell find $(TESTDIR)/$(SRCDIR) -type f -name '*.js')
ALL_SRCS := $(APP_SRCS) $(TEST_SRCS)

# Externs files (required for closure compilation).
EXTERNS := $(CURDIR)/$(BUILDDIR)/externs.js
CHROME_EXTERNS := $(CURDIR)/$(BUILDDIR)/$(notdir $(CHROME_EXTERNS_URL))
QUNIT_EXTERNS := $(CURDIR)/$(BUILDDIR)/$(notdir $(QUNIT_EXTERNS_URL))

# Closure compiler and arguments.
CLOSURE_COMPILER := $(CURDIR)/$(BUILDDIR)/compiler.jar
CLOSURE := java -jar $(CLOSURE_COMPILER)

# --compilation_level options:
#   WHITESPACE_ONLY, SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZATIONS
CLOSURE_ARGS := --warning_level VERBOSE \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --language_in ECMASCRIPT5_STRICT \
  --summary_detail_level 3 \
  --externs $(EXTERNS) --externs $(CHROME_EXTERNS) --externs $(QUNIT_EXTERNS)

# 'all' builds everything.
all : debug release test

# Compile a debug build.
debug : setup
	# Copy the $(APPDIR) into $(OUTDIR)/$(DEBUGDIR).
	rm -rf $(OUTDIR)/$(DEBUGDIR)
	mkdir -p $(OUTDIR)/$(DEBUGDIR)
	cp -r $(APPDIR)/* $(OUTDIR)/$(DEBUGDIR)
	
	# Compile the $(OUTDIR)/$(DEBUGDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js source.
	cd $(OUTDIR)/$(DEBUGDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		$(patsubst %, --js $(SRCDIR)/%, $(notdir $(APP_SRCS))) \
		--js_output_file $(PROJECT).js \
		--create_source_map $(PROJECT).js.map
	
	# Tell $(PROJECT).js where the source map is.
	echo "//@ sourceMappingURL=$(PROJECT).js.map" >> $(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js


# Compile a release build.
release : setup
	# Copy the $(APPDIR) into $(OUTDIR)/$(RELEASEDIR).
	rm -rf $(OUTDIR)/$(RELEASEDIR)
	mkdir -p $(OUTDIR)/$(RELEASEDIR)
	cp -r $(APPDIR)/* $(OUTDIR)/$(RELEASEDIR)
	
	# Compile the $(OUTDIR)/$(RELEASEDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(RELEASEDIR)/$(PROJECT).js source.
	cd $(OUTDIR)/$(RELEASEDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		$(patsubst %, --js $(SRCDIR)/%, $(notdir $(APP_SRCS))) \
		--js_output_file $(PROJECT).js
	
	# Remove the original source files.
	rm -rf $(OUTDIR)/$(APPDIR)/$(SRCDIR)
	
	# Create a zipped copy of the $(OUTDIR)/$(APPDIR) directory.
	rm -f $(OUTDIR)/$(PROJECT).zip
	zip --junk-paths $(OUTDIR)/$(PROJECT).zip $(OUTDIR)/$(RELEASEDIR)/*


# Compile the test app.
test : setup
	# Copy the $(TESTDIR) into $(OUTDIR)/$(TESTDIR)
	rm -rf $(OUTDIR)/$(TESTDIR)
	mkdir -p $(OUTDIR)/$(TESTDIR)
	cp -r $(TESTDIR)/* $(OUTDIR)/$(TESTDIR)
	
	# Add in all the original source files to be tested.
	cp $(APP_SRCS) $(OUTDIR)/$(TESTDIR)/$(SRCDIR)/
	
	# Compile the $(OUTDIR)/$(TESTDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js source.
	cd $(OUTDIR)/$(TESTDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		$(patsubst %, --js $(SRCDIR)/%, $(notdir $(ALL_SRCS))) \
		--js_output_file $(PROJECT)_test.js \
		--create_source_map $(PROJECT).js.map

	# Tell $(PROJECT).js where the source map is.
	echo "//@ sourceMappingURL=$(PROJECT).js.map" >> $(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js


# Prepare the $(BUILD) directory.
setup : $(CLOSURE_COMPILER) $(CHROME_EXTERNS) $(QUNIT_EXTERNS)


# Download the closure compiler.
$(CLOSURE_COMPILER) :
	mkdir -p $(BUILDDIR)
	curl $(CLOSURE_URL) -o $(BUILDDIR)/compiler-latest.zip
	unzip $(BUILDDIR)/compiler-latest.zip compiler.jar -d $(BUILDDIR)
	rm $(BUILDDIR)/compiler-latest.zip


# Download externs for the chrome.* APIs.
$(CHROME_EXTERNS) :
	mkdir -p $(BUILDDIR)
	curl $(CHROME_EXTERNS_URL) -o $(CHROME_EXTERNS)


# Download externs for QUnit.
$(QUNIT_EXTERNS) :
	mkdir -p $(BUILDDIR)
	curl $(QUNIT_EXTERNS_URL) -o $(QUNIT_EXTERNS)


# Lints all .js files.
lint :
	gjslint $(ALL_SRCS) $(EXTERNS)


# Clean up output files.
clean :
	rm -rf $(OUTDIR)


# Run the debug build in Chrome.
run_debug : 
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(DEBUGDIR)"


# Run the debug build in Chrome.
run_release : 
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(RELEASEDIR)"


# Run the tests in Chrome.
run_test : 
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(TESTDIR)"
