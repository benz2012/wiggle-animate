#! /bin/bash

COMMAND="npm run test -- --update-snapshots"

docker run --rm -v ${PWD}/tests:/usr/local/app/tests playwright-linux-screenshotter $COMMAND
