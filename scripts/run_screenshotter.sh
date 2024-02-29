#! /bin/bash

COMMAND="npm run test -- --update-snapshots"

docker run --rm \
  -v ${PWD}/src:/usr/local/app/src \
  -v ${PWD}/tests:/usr/local/app/tests \
  -v ${PWD}/public:/usr/local/app/public \
  playwright-linux-screenshotter $COMMAND

# TODO [4]: goal to reduce the load on the repo
# - have this script move the resulting screenshots somewhere else
# - that other folder will also be a git repo
# - commit the photos, and push to github
# - then modify the Github CI test to pull in the photos from that repo before running the test

