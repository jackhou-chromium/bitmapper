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
DEBUGDIR := debug
RELEASEDIR := release
BUILDDIR := build
TEST_EXCLUDES := main.js

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


# Closure compiled output js for Debug.
$(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js : $(APP_SRCS)
	# Compile the $(OUTDIR)/$(DEBUGDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js source.
	cd $(OUTDIR)/$(DEBUGDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		$(patsubst %, --js $(CURDIR)/$(APPDIR)/$(SRCDIR)/%, $(notdir $(APP_SRCS))) \
		--js_output_file $(PROJECT).js \
		--create_source_map $(PROJECT).js.map
	
	# Tell $(PROJECT).js where the source map is.
	echo "//@ sourceMappingURL=$(PROJECT).js.map" >> \
		$(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js

copy_debug_files :
	# Copy the $(APPDIR) into $(OUTDIR)/$(DEBUGDIR).
	mkdir -p $(OUTDIR)
	cp -rT $(APPDIR) $(OUTDIR)/$(DEBUGDIR)

# Compile a debug build.
debug : setup copy_debug_files $(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js

# Closure compiled output js for Release.
$(OUTDIR)/$(RELEASEDIR)/$(PROJECT).js : $(APP_SRCS)
	# Compile the $(CURDIR)/$(APPDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(RELEASEDIR)/$(PROJECT).js source.
	cd $(OUTDIR)/$(RELEASEDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		$(patsubst %, --js $(CURDIR)/$(APPDIR)/$(SRCDIR)/%, $(notdir $(APP_SRCS))) \
		--js_output_file $(PROJECT).js

copy_release_files :
	# Copy the $(APPDIR) into $(OUTDIR)/$(RELEASEDIR).
	mkdir -p $(OUTDIR)
	cp -rT $(APPDIR) $(OUTDIR)/$(RELEASEDIR)
	
	# Remove the original source files.
	rm -rf $(OUTDIR)/$(RELEASEDIR)/$(SRCDIR)

# Compile a release build.
release : setup copy_release_files $(OUTDIR)/$(RELEASEDIR)/$(PROJECT).js
	# Create a zipped copy of the $(OUTDIR)/$(APPDIR) directory.
	rm -f $(OUTDIR)/$(PROJECT).zip
	zip --junk-paths $(OUTDIR)/$(PROJECT).zip $(OUTDIR)/$(RELEASEDIR)/*


# Closure compiled output js for Test.
$(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js : $(APP_SRCS) $(TEST_SRCS)
	# Compile the $(OUTDIR)/$(TESTDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js source.
	cd $(OUTDIR)/$(TESTDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		$(patsubst %, --js $(SRCDIR)/%, \
			$(filter-out $(TEST_EXCLUDES), $(notdir $(ALL_SRCS)))) \
		--js_output_file $(PROJECT)_test.js \
		--create_source_map $(PROJECT)_test.js.map

	# Tell $(PROJECT).js where the source map is.
	echo "//@ sourceMappingURL=$(PROJECT)_test.js.map" >> \
		$(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js

copy_test_files :
	# Copy the $(TESTDIR) into $(OUTDIR)/$(TESTDIR)
	mkdir -p $(OUTDIR)
	cp -rT $(TESTDIR) $(OUTDIR)/$(TESTDIR)

	# Add in all the original source files to be tested.
	cp $(APP_SRCS) $(OUTDIR)/$(TESTDIR)/$(SRCDIR)/

# Compile the test app.
test : setup copy_test_files $(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js


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
run_debug : debug
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(DEBUGDIR)"


# Run the release build in Chrome.
run_release : release
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(RELEASEDIR)"


# Run the tests in Chrome.
run_test : test
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(TESTDIR)"


.PHONY : run_debug run_release run_test clean lint setup debug release test \
				 copy_debug_files copy_release_files copy_test_files all
