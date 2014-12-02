# Generic project requirements not specific to bitmapper.

# URLs for auto-collected resources.
CLOSURE_URL := http://dl.google.com/closure-compiler/compiler-latest.zip
CHROME_EXTERNS_URL := https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/chrome_extensions.js
QUNIT_EXTERNS_URL := https://raw.githubusercontent.com/lukeasrodgers/qunit-js-externs/master/qunit-externs.js

# Externs files (required for closure compilation).
EXTERNS := $(CURDIR)/$(BUILDDIR)/externs.js
CHROME_EXTERNS := $(CURDIR)/$(BUILDDIR)/$(notdir $(CHROME_EXTERNS_URL))
QUNIT_EXTERNS := $(CURDIR)/$(BUILDDIR)/$(notdir $(QUNIT_EXTERNS_URL))

# Closure compiler and arguments.
CLOSURE_COMPILER := $(CURDIR)/$(BUILDDIR)/compiler.jar
CLOSURE := java -jar $(CLOSURE_COMPILER)

# Vulcanize and arguments.
VULCANIZE = vulcanize
VULCANIZE_FLAGS = --csp -p $(APPDIR)

# Polymer path to download required components through bower.
BOWER_INSTALL := bower install --save
BOWER_PATH := $(APPDIR)/bower_components

# Save polymer to app directory.
polymer.updated :
	mkdir -p $(BOWER_PATH)
	$(BOWER_INSTALL) Polymer/polymer
	$(BOWER_INSTALL) Polymer/core-elements
	$(BOWER_INSTALL) Polymer/paper-elements
	touch $@

SETUP := $(CLOSURE_COMPILER) $(CHROME_EXTERNS) $(QUNIT_EXTERNS) polymer.updated

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
