PROJECT := bitmapper
APPDIR := app
TESTDIR := test
SRCDIR := js
OUTDIR := out
BUILDDIR := build

# URLs for auto-collected resources.
CLOSURE_URL := http://dl.google.com/closure-compiler/compiler-latest.zip

# SRCS ordered by dependency order.
SRCS := namespace.js imageFile.js main.js
TEST_SRCS := imageFile_test.js
EXTERNS := build/externs.js

# Paths to the above sources in the output directory.
OUT_SRCS := $(patsubst %,$(OUTDIR)/$(APPDIR)/$(SRCDIR)/%,$(SRCS))
OUT_TEST_SRCS := $(patsubst %,$(OUTDIR)/$(TESTDIR)/$(SRCDIR)/%,$(TEST_SRCS))

# All files in these directories.
APP_FILES := $(shell find $(APPDIR) -type f -not -name '.*')
TEST_FILES := $(shell find $(TESTDIR) -type f -not -name '.*')

# Style checker for JavaScript files.
LINT := gjslint

# Closure compiler and arguments.
CLOSURE_COMPILER := $(BUILDDIR)/compiler.jar
CLOSURE := java -jar $(CLOSURE_COMPILER)

# --compilation_level options:
#   WHITESPACE_ONLY, SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZATIONS
CLOSURE_ARGS := --warning_level VERBOSE \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --language_in ECMASCRIPT5_STRICT \
  --formatting=pretty_print \
  --summary_detail_level 3
CLOSURE_LINT_ARGS := --warning_level VERBOSE \
  --compilation_level WHITESPACE_ONLY \
  --language_in ECMASCRIPT5_STRICT \
  --formatting=pretty_print \
  --summary_detail_level 3


# 'all' builds everything.
all : $(OUTDIR)/$(PROJECT).zip test

# Lints all .js files.
lint : $(OUT_SRCS) $(OUT_TEST_SRCS) $(OUT_EXTERNS)

# Zip the built app.
$(OUTDIR)/$(PROJECT).zip : app
	rm -f $@
	zip --junk-paths $@ $(OUTDIR)/$(APPDIR)/*

# The main app requires all app files and the compiled source.
app : copy_app_files $(OUTDIR)/$(APPDIR)/$(PROJECT).js

# Copy files from the app directory into the output.
copy_app_files : $(APP_FILES)
	mkdir -p $(OUTDIR)/$(APPDIR)
	cp -r $(APPDIR)/* $(OUTDIR)/$(APPDIR)

# The compiled source requires the compiler, externs file, and all app sources.
$(OUTDIR)/$(APPDIR)/$(PROJECT).js : \
$(CLOSURE_COMPILER) $(OUT_SRCS)
	$(CLOSURE) $(CLOSURE_ARGS) \
		--externs $(EXTERNS) \
		$(patsubst %,--js %,$(OUT_SRCS)) \
		--js_output_file $@

# Lint the externs file and copy to output directory.
$(OUT_EXTERNS) : $(EXTERNS)
	$(LINT) --unix_mode $< 

# The test app requires all test files and linted test sources.
test : copy_test_files $(OUT_TEST_SRCS)

# Copy files from the test directory into the output.
copy_test_files : $(OUT_SRCS) $(TEST_FILES)
	mkdir -p $(OUTDIR)/$(TESTDIR)/$(SRCDIR)
	cp -r $(TESTDIR)/* $(OUTDIR)/$(TESTDIR)
	cp $(APP_SRCS) $(OUTDIR)/$(TESTDIR)/$(SRCDIR)

# For any target in the output source directory, get the corresponding source
# and lint it.
$(OUTDIR)/$(APPDIR)/$(SRCDIR)/%.js : $(APPDIR)/$(SRCDIR)/%.js
	mkdir -p $(OUTDIR)/$(SRCDIR)
	$(LINT) --unix_mode $<
	$(CLOSURE) $(CLOSURE_LINT_ARGS) --js $< --js_output_file $@

# Always rebuild these targets.
.PHONY : copy_app_files copy_test_files

# Download the closure compiler.
$(CLOSURE_COMPILER) :
	mkdir -p $(BUILDDIR)
	curl $(CLOSURE_URL) -o $(BUILDDIR)/compiler-latest.zip
	unzip $(BUILDDIR)/compiler-latest.zip compiler.jar -d $(BUILDDIR)
	rm $(BUILDDIR)/compiler-latest.zip

# Run the app in Chrome.
run_app : app
	google-chrome --load-and-launch-app='$(CURDIR)/$(OUTDIR)/$(APPDIR)'

# Run the tests in Chrome.
run_test : test
	google-chrome --load-and-launch-app='$(CURDIR)/$(OUTDIR)/$(TESTDIR)'

