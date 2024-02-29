#! /bin/bash

COMMAND="npm run test -- --update-snapshots"

docker run --rm \
  -v ${PWD}/src:/usr/local/app/src \
  -v ${PWD}/tests:/usr/local/app/tests \
  -v ${PWD}/public:/usr/local/app/public \
  playwright-linux-screenshotter $COMMAND
