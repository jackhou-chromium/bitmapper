# Project name
PROJECT := bitmapper

# Directory structure.
APPDIR := app
DEPSDIR := deps
SRCDIR := js
TESTDIR := test
OUTDIR := out
DEBUGDIR := debug
RELEASEDIR := release
BUILDDIR := build
TEST_EXCLUDES := main.js

# Javascript source files to edit.
# IMPORTANT: These must be in dependency order.
SRCS := namespace.js util.js imagefile.js zoommanager.js colorpalette.js \
    tool.js penciltool.js buckettool.js pipettetool.js \
    selectiontool.js selectioncanvasmanager.js cursorguide.js main.js

APP_SRCS := $(patsubst %,$(APPDIR)/$(SRCDIR)/%,$(SRCS))

TEST_SRCS := $(TESTDIR)/$(SRCDIR)/setup.js \
    $(shell find $(TESTDIR)/$(SRCDIR) -type f -name '*_test.js')

ALL_SRCS := $(APP_SRCS) $(TEST_SRCS)

APP_HTML_FILES := $(shell find $(APPDIR) -type f -name '*.html')

TEST_FILE_LIST := manifest.json background.js \
    test-image.png test-image-zoom.png test-jpg-image.jpg
TEST_FILES := $(patsubst %,$(TESTDIR)/%,$(TEST_FILE_LIST))

ICON_SIZES := 16x16 32x32 48x48 64x64 96x96 128x128
DEBUG_ICONS := $(patsubst \
    %,$(OUTDIR)/$(DEBUGDIR)/icons/bitmapper_icon_%.png,$(ICON_SIZES))
RELEASE_ICONS := $(patsubst \
    %,$(OUTDIR)/$(RELEASEDIR)/icons/bitmapper_icon_%.png,$(ICON_SIZES))
TEST_ICONS := $(patsubst \
    %,$(OUTDIR)/$(TESTDIR)/icons/bitmapper_icon_%.png,$(ICON_SIZES))

# TODO(tapted): Ideally this would filter out source files that get bundled up
# in the closure-compiled .js, as well as un-vulcanized html. But having those
# files in the output dir is useful for debugging, so keep the dependency.
APP_FILES := $(shell find $(APPDIR) -type f)

# First target in the file is the default target. Default to `debug`.
default: debug
	@echo '== `rm bower.updated` to update bower_components.'
	@echo '== `rm $(CLOSURE_COMPILER)` to update closure.'
	@echo '== `make test` to build tests.'
	@echo '== `make debug` or `make out/$(PROJECT).zip` if you do not want'\
	  'to see this message.'

# 'all' builds everything.
all : debug release test

include requirements.mk

# --compilation_level options:
#   WHITESPACE_ONLY, SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZATIONS
CLOSURE_ARGS := --warning_level VERBOSE \
  --language_in ECMASCRIPT5_STRICT \
  --summary_detail_level 3 \
  --jscomp_error=reportUnknownTypes \
  --externs $(EXTERNS) --externs $(CHROME_EXTERNS) --externs $(QUNIT_EXTERNS)

# Closure compiled output js for Debug. WHITESPACE_ONLY for ease of debugging.
$(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js : $(APP_SRCS) $(EXTERNS)
	# Compile the $(OUTDIR)/$(DEBUGDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js source.
	cd $(OUTDIR)/$(DEBUGDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		--compilation_level WHITESPACE_ONLY \
		$(patsubst %, --js $(SRCDIR)/%, $(SRCS)) \
		--js_output_file $(PROJECT).js \
		--create_source_map $(PROJECT).js.map

	# Tell $(PROJECT).js where the source map is.
	echo "//@ sourceMappingURL=$(PROJECT).js.map" >> \
		$(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js

%.prepared : $(APP_FILES)
	# Copy the $(APPDIR) into $(dir $@).
	# TODO(tapted): Make this more selective -- there is too much stuff in
	# app/ that doesn't need to be put in the webstore release.
	mkdir -p $(dir $@)
	mkdir -p $(dir $@)/icons
	cp -r $(APPDIR)/* $(dir $@)
	touch $@

# Icons for debug build come from icons/badge.
$(OUTDIR)/$(DEBUGDIR)/icons/%.png : icons/badge/%.png
	cp $< $@

# Icons for release build come from icons.
$(OUTDIR)/$(RELEASEDIR)/icons/%.png : icons/%.png
	cp $< $@

# Icons for test build come from icons/badge.
$(OUTDIR)/$(TESTDIR)/icons/%.png : icons/badge/%.png
	cp $< $@

# Compile a debug build. This depends on the release build so the debug build
# gets type checking.
debug : $(SETUP) \
        $(OUTDIR)/$(DEBUGDIR)/.prepared \
        $(DEBUG_ICONS) \
        $(OUTDIR)/$(RELEASEDIR)/$(PROJECT).js \
        $(OUTDIR)/$(DEBUGDIR)/build.html \
        $(OUTDIR)/$(DEBUGDIR)/$(PROJECT).js

# Closure compiled output js for Release.
$(OUTDIR)/$(RELEASEDIR)/$(PROJECT).js : $(APP_SRCS) $(EXTERNS)
	mkdir -p $(OUTDIR)/$(RELEASEDIR)
	# Compile the $(CURDIR)/$(APPDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(RELEASEDIR)/$(PROJECT).js source.
	cd $(OUTDIR)/$(RELEASEDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		--compilation_level ADVANCED_OPTIMIZATIONS \
		$(patsubst %, --js $(CURDIR)/%, $(APP_SRCS)) \
		--js_output_file $(PROJECT).js --formatting PRETTY_PRINT

out/$(PROJECT).zip : $(SETUP) \
          $(OUTDIR)/$(RELEASEDIR)/.prepared \
          $(RELEASE_ICONS) \
          $(OUTDIR)/$(RELEASEDIR)/$(PROJECT).js \
          $(OUTDIR)/$(RELEASEDIR)/build.html
	# Remove the original source files.
	rm -rf "$(OUTDIR)/$(RELEASEDIR)/$(SRCDIR)"
	# Create a zipped copy of the $(OUTDIR)/$(APPDIR) directory.
	rm -f $(OUTDIR)/$(PROJECT).zip
	(cd $(OUTDIR)/$(RELEASEDIR); zip -r ../$(PROJECT).zip ./*)

# Compile a release build.
release : out/$(PROJECT).zip

# Closure compiled output js for Test. WHITESPACE_ONLY for ease of debugging.
$(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js : $(APP_SRCS) $(TEST_SRCS) $(EXTERNS)
	# Compile the $(OUTDIR)/$(TESTDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js source.
	cd $(OUTDIR)/$(TESTDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		--compilation_level WHITESPACE_ONLY \
		--formatting=pretty_print \
		$(patsubst %, --js $(SRCDIR)/%, \
			$(filter-out $(TEST_EXCLUDES), $(notdir $(ALL_SRCS)))) \
		--js_output_file $(PROJECT)_test.js \
		--create_source_map $(PROJECT)_test.js.map
	# Tell $(PROJECT).js where the source map is.
	echo "//@ sourceMappingURL=$(PROJECT)_test.js.map" >> \
		$(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js

copy_test_files : $(TEST_FILES)
	mkdir -p $(OUTDIR)/$(TESTDIR)
	cp $(TEST_FILES) $(OUTDIR)/$(TESTDIR)
	cp -r $(TESTDIR)/js $(OUTDIR)/$(TESTDIR)
	cp -r $(TESTDIR)/deps $(OUTDIR)/$(TESTDIR)
	# Add a symlink so that app/elements/../bower_components points to
	# out/test/bower_components. TODO(tapted): Find a better way to do this.
	(cd $(OUTDIR)/$(TESTDIR) && ln -snf . app)
	# Add in all the original source files to be tested.
	cp $(APP_SRCS) $(OUTDIR)/$(TESTDIR)/$(SRCDIR)/
	# Copy apps deps.
	cp -r $(APPDIR)/$(DEPSDIR)/* $(OUTDIR)/$(TESTDIR)/$(DEPSDIR)/

# TODO(mgiuca): Remove main.html from the out directory.
# Run vulcanize on the app/main.html file output to out/debug/build.(html|js)
# whenever any html file changed.
%/build.html : $(APP_HTML_FILES) %/.prepared
	$(VULCANIZE) $(VULCANIZE_FLAGS) -o $@ $(APPDIR)/main.html

%/test_build.html : test/test.html
	$(VULCANIZE) --csp -p test -o $@ $<

# Compile the test app.
test : $(SETUP) copy_test_files \
       $(TEST_ICONS) \
       $(OUTDIR)/$(TESTDIR)/$(PROJECT)_test.js \
       $(OUTDIR)/$(TESTDIR)/build.html \
       $(OUTDIR)/$(TESTDIR)/test_build.html

# Lints all .js files.
lint :
	gjslint --jslint_error=all $(ALL_SRCS)


# Clean up output files.
clean :
	rm -rf $(OUTDIR)


# Run the debug build in Chrome.
run_debug : debug
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(DEBUGDIR)"


# Run the release build in Chrome.
run_release : out/$(PROJECT).zip
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(RELEASEDIR)"


# Run the tests in Chrome.
run_test : test
	google-chrome --load-and-launch-app="$(CURDIR)/$(OUTDIR)/$(TESTDIR)"


.PHONY : debug release run_debug run_release \
         test copy_test_files run_test \
         clean lint all default
