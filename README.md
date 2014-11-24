bitmapper
=========

Pixel art editor Chrome App

Build
-----

Install the linter:

    sudo apt-get install python-setuptools
    sudo easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz

Get the code:

    git clone https://github.com/jackhou-chromium/bitmapper.git

Build and test:

    make run_debug
    make run_test

Release
-------

Make a release build:

    make release

Load `out/release` as an unpacked app, or upload `out/bitmapper.zip` to the
Chrome Web Store.

Contribute
----------

Install depot_tools for git-cl:

    git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
    export PATH="$PATH:$HOME/depot_tools"

You should add the export line to your `~/.bashrc`.

Have git automatically set the upstream branch when creating new branches:

    git config branch.autosetupmerge always

Upload a change:

    git cl upload

This uploads all commits in the current branch relative to the branch's
upstream.

Before landing a change, you need to set the branch to push to GitHub:

    git config branch.<your-branch-name>.remote origin

Push your change (after getting an lgtm):

    git cl land

The presubmit will prompt you to set the current branch's remote to 'origin' so
that the change will be pushed to this GitHub repo.
