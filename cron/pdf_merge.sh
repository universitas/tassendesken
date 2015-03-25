#!/bin/bash

# load environmental variables.
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
source $DIR/cron_environment_variables.sh

echo $DIR $PDF_FOLDER $ISSUE

# SCRIPT_FOLDER=$DIR
# PDF_FOLDER="/home/haakenlid/Desktop/PDF"
# YEAR=2015
# ISSUE=8

cd "$PDF_FOLDER"
mkdir -p "web"
output_file="web/universitas-$YEAR-$ISSUE.pdf"
cmyk_profile="$SCRIPT_FOLDER/ISOnewspaper26v4.icc"
rgb_profile="$SCRIPT_FOLDER/sRGB.icc"

echo $output_file $cmyk_profile $rgb_profile

# Compile pdf files into multipage document.
  # -dUseCIEColor=true \
  # -dProcessColorModel=/DeviceRGB \
  # -sDefaultCMYKProfile=$cmyk_profile \
  # -dProcessColorModel=/DeviceRGB \
  # -dColorConversionStrategy=/sRGB \
/usr/bin/gs \
  -dUseCIEColor=true \
  -dProcessColorModel=/DeviceRGB \
  -dColorConversionStrategyForImages=/DeviceRGB \
  -dBATCH  \
  -dNOPAUSE  \
  -sDEVICE=pdfwrite  \
  -dCompatibilityLevel=1.4 \
  -dFastWebView=true \
  -dConvertCMYKImagesToRGB=true \
  -dDownsampleColorImages=true \
  -dDownsampleGrayImages=true \
  -dDownsampleMonoImages=true \
  -dColorImageResolution=120 \
  -dGrayImageResolution=120 \
  -dMonoImageResolution=120 \
  -sOutputFile="$output_file" \
   UNI11VER*.pdf
