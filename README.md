bitmapper
=========

Pixel art editor Chrome App

Instructions
------------

Install the linter:

    sudo apt-get install python-setuptools
    sudo easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz

Get the code:

    git clone https://github.com/jackhou-chromium/bitmapper.git

Build and test:

    make run_app
    make run_test

Install depot_tools for git-cl:

    git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
    export PATH="$PATH:$HOME/depot_tools"

You should add the export line to your `~/.bashrc`.

Upload a change:

    git cl upload

This uploads all commits in the current branch relative to the branch's
upstream.

Push your change (after getting an lgtm):

    git cl push
