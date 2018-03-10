#!/bin/bash
#Install dependency
echo "Installing node dependencies..."
yarn install --prefer-offline --pure-lockfile
#echo "Removing cache dependencies"
#rm -rf ./npm-packages-offline-cache
#Run CMD parameter as PID 0
exec $@
