#!/bin/bash

echo "Preparing zip for apiproxy:"
zip -r - apiproxies environments > ./apiproxy.zip
