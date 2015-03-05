#!/bin/bash

# load environmental variables.
source ${0%/*}/cron_environment_variables.sh

cd "$PDF_FOLDER"
mkdir -p "web"
output_file="universitas-$YEAR-$ISSUE.pdf"
color_profile="$SCRIPT_FOLDER/ISOnewspaper26v4.icc"

# Compile pdf files into multipage document.
/usr/bin/gs \
  -sDefaultCMYKProfile=$color_profile \
  -dFastWebView=true \
  -sDEVICE=pdfwrite  \
  -dBATCH  \
  -dNOPAUSE  \
  -dCompatibilityLevel=1.4 \
  -dConvertCMYKImagesToRGB=true \
  -dDownsampleColorImages=true \
  -dDownsampleGrayImages=true \
  -dDownsampleMonoImages=true \
  -dColorImageResolution=120 \
  -dGrayImageResolution=120 \
  -dMonoImageResolution=120 \
  -dProcessColorModel=/DeviceRGB \
  -dUseCIEColor=true \
  -sOutputFile="$output_file" \
   UNI11VER*.pdf
