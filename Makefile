# Project name
PROJECT := bitmapper

# URLs for auto-collected resources.
CLOSURE_URL := http://dl.google.com/closure-compiler/compiler-latest.zip

# Directory structure.
APPDIR := app
TESTDIR := test
OUTDIR := out
BUILDDIR := build
SRCDIR := js

# Javascript source files to edit.
APP_SRCS := $(shell find $(APPDIR)/$(SRCDIR) -type f -name '*.js')
TEST_SRCS := $(shell find $(TESTDIR)/$(SRCDIR) -type f -name '*.js')
ALL_SRCS := $(APP_SRCS) $(TEST_SRCS)

# Externs files (required for closure compilation).
EXTERNS := $(BUILDDIR)/externs.js

# Closure compiler and arguments.
CLOSURE_COMPILER := $(CURDIR)/$(BUILDDIR)/compiler.jar
CLOSURE := java -jar $(CLOSURE_COMPILER)

# --compilation_level options:
#   WHITESPACE_ONLY, SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZATIONS
CLOSURE_ARGS := --warning_level VERBOSE \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --language_in ECMASCRIPT5_STRICT \
  --summary_detail_level 3 \
  --externs $(CURDIR)/$(EXTERNS)

# 'all' builds everything.
all : app test


# Compile a $(PROJECT).js file using advanced optimizations.
app : $(BUILDDIR) $(APP_SRCS)
	# Copy the $(APPDIR) into $(OUTDIR)/$(APPDIR).
	rm -rf $(OUTDIR)/$(APPDIR)
	mkdir -p $(OUTDIR)/$(APPDIR)
	cp -r $(APPDIR)/* $(OUTDIR)/$(APPDIR)
	
	# Compile the $(OUTDIR)/$(APPDIR)/$(SRCDIR)/*.js files
	# into a single $(OUTDIR)/$(APPDIR)/$(PROJECT).js source.
	cd $(OUTDIR)/$(APPDIR) && \
	$(CLOSURE) $(CLOSURE_ARGS) \
		$(patsubst %, --js $(SRCDIR)/%, $(notdir $(APP_SRCS))) \
		--js_output_file $(PROJECT).js
	
	# Remove the original source files.
	rm -rf $(OUTDIR)/$(APPDIR)/$(SRCDIR)
	
	# Create a zipped copy of the $(OUTDIR)/$(APPDIR) directory.
	rm -f $(OUTDIR)/$(PROJECT).zip
	zip --junk-paths $(OUTDIR)/$(PROJECT).zip $(OUTDIR)/$(APPDIR)/*


# Compile the test app.
test : $(BUILDDIR) $(ALL_SRCS)
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


# Prepare the $(BUILD) directory.
$(BUILDDIR) : $(CLOSURE_COMPILER) 


# Download the closure compiler.
$(CLOSURE_COMPILER) :
	mkdir -p $(BUILDDIR)
	curl $(CLOSURE_URL) -o $(BUILDDIR)/compiler-latest.zip
	unzip $(BUILDDIR)/compiler-latest.zip compiler.jar -d $(BUILDDIR)
	rm $(BUILDDIR)/compiler-latest.zip


# Lints all .js files.
lint :
	gjslint $(ALL_SRCS) $(EXTERNS)


# Clean up output files.
clean :
	rm -rf $(OUTDIR)


# Run the app in Chrome.
run_app : app
	google-chrome --load-and-launch-app='$(CURDIR)/$(OUTDIR)/$(APPDIR)'


# Run the tests in Chrome.
run_test : test
	google-chrome --load-and-launch-app='$(CURDIR)/$(OUTDIR)/$(TESTDIR)'

