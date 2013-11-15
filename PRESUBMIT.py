# Copyright 2013 Google Inc. All rights reserved.
# Use of this source code is governed by the Apache license that can be
# found in the LICENSE file.

"""Presubmit checks for bitmapper."""

import subprocess
import sys


def CheckChangeOnUpload(input_api, output_api):
  """Checks that the linter has been run on all .js files"""
  results = [];

  try:
    subprocess.check_output(['make', 'lint'])
  except subprocess.CalledProcessError:
    results.append(output_api.PresubmitError(
        'Linter has errors or could not be run.'))

  return results


def CheckChangeOnCommit(input_api, output_api):
  """Checks that the CL got an lgtm, and sets the current branch's remote to
  'origin' so that 'git cl push' pushes to the Github repo."""
  results = []
  checks = input_api.canned_checks

  results.extend(checks.CheckChangeWasUploaded(input_api, output_api))

  if not results:
    results.extend(checks.CheckOwners(input_api, output_api))

  if not results:
    branch = subprocess.check_output(
        ['git', 'rev-parse', '--abbrev-ref', 'HEAD']).strip()
    remote = subprocess.check_output(
        ['git', 'config', 'branch.%s.remote' % branch]).strip()
    if (remote != 'origin'):
      set_remote = raw_input(
          'Remote (%s) should be set to \'origin\', set it now [y|n]?' % remote)
      if (set_remote.startswith('y')):
        subprocess.check_output(
            ['git', 'config', 'branch.%s.remote' % branch, 'origin'])
      else:
        results.append(output_api.PresubmitError(
            'Remote must be set to \'origin\' to push to Github.'))

  return results
