PROJECT := bitmapper
APPDIR := app
TESTDIR := test
SRCDIR := js
OUTDIR := out

# SRCS ordered by dependency order
SRCS := namespace.js imageFile.js
APP_SRCS := $(SRCS) main.js
TEST_SRCS := $(SRCS) imageFile_test.js
EXTERNS := build/externs.js

# Paths to the above sources in the output directory.
OUT_SRCS := $(patsubst %,$(OUTDIR)/$(SRCDIR)/%,$(SRCS))
OUT_APP_SRCS := $(patsubst %,$(OUTDIR)/$(SRCDIR)/%,$(APP_SRCS))
OUT_TEST_SRCS := $(patsubst %,$(OUTDIR)/$(TESTDIR)/%,$(TEST_SRCS))
OUT_EXTERNS := $(OUTDIR)/build/externs.js

# All files in these directories.
APP_FILES := $(shell find $(APPDIR) -type f -not -name '.*')
TEST_FILES := $(shell find $(TESTDIR) -type f -not -name '.*') \
	$(shell find third_party -type f -not -name '.*')

# Compilation_level options:
#   WHITESPACE_ONLY, SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZATIONS
LINT := /usr/local/bin/gjslint
CLOSURE := java -jar $(OUTDIR)/compiler.jar

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

# Zip the built app.
$(OUTDIR)/$(PROJECT).zip : app
	rm -f $@
	zip --junk-paths $@ $(OUTDIR)/$(APPDIR)/*

# The main app requires all app files and the compiled source.
app : copy_app_files $(OUTDIR)/$(APPDIR)/$(PROJECT).js

# Copy files from the app directory into the output.
copy_app_files : $(APP_FILES)
	mkdir -p $(OUTDIR)/$(APPDIR)
	cp $^ $(OUTDIR)/$(APPDIR)

# The compiled source requires the compiler, externs file, and all app sources.
# Also rebuild this when the makefile changes.
$(OUTDIR)/$(APPDIR)/$(PROJECT).js : \
$(OUTDIR)/compiler.jar $(OUT_EXTERNS) $(OUT_APP_SRCS) Makefile
	$(CLOSURE) $(CLOSURE_ARGS) \
		--externs $(OUT_EXTERNS) \
		$(patsubst %,--js %,$(OUT_APP_SRCS)) \
		--js_output_file $@

# Lint the externs file and copy to output directory.
$(OUT_EXTERNS) : $(EXTERNS)
	mkdir -p $(OUTDIR)/build
	$(LINT) --unix_mode $< && cp $< $@

# The test app requires all test files and linted test sources.
test : copy_test_files $(OUT_TEST_SRCS)

# Copy files from the test directory into the output.
copy_test_files : $(TEST_FILES)
	mkdir -p $(OUTDIR)/$(TESTDIR)
	cp $^ $(OUTDIR)/$(TESTDIR)

# For any target in the output test directory, copy it from the output source
# directory.
$(OUTDIR)/$(TESTDIR)/%.js : $(OUTDIR)/$(SRCDIR)/%.js
	cp $< $@

# For any target in the output source directory, get the corresponding source
# and lint it.
$(OUTDIR)/$(SRCDIR)/%.js : $(SRCDIR)/%.js
	mkdir -p $(OUTDIR)/$(SRCDIR)
	$(LINT) --unix_mode $<
	$(CLOSURE) $(CLOSURE_LINT_ARGS) --js $< --js_output_file $@

# Always rebuild these targets.
.PHONY : copy_app_files copy_test_files

# Download and extract the compiler.
$(OUTDIR)/compiler.jar :
	curl -o $(OUTDIR)/compiler-latest.zip \
		http://closure-compiler.googlecode.com/files/compiler-latest.zip
	unzip $(OUTDIR)/compiler-latest.zip compiler.jar -d $(OUTDIR)
	rm $(OUTDIR)/compiler-latest.zip

# Run the app in Chrome
run_app : all
	google-chrome --load-and-launch-app=$(OUTDIR)/$(APPDIR)

# Run the tests in Chrome
run_test : all
	google-chrome --load-and-launch-app=$(OUTDIR)/$(TESTDIR)

