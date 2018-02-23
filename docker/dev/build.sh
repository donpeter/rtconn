#!/bin/bash
#Install dependency
echo "Installing node dependencies..."
yarn install --prefer-offline
echo "Dependencies Installed"
#Run CMD parameter as PID 0
exec $@
