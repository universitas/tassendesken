#!/bin/bash

# load environmental variables.
source ${0%/*}/cron_environment_variables.sh

# L=1200
L=800
M=500
S=150

cd "$PDF_FOLDER"
mkdir -p "png_$L"
# mkdir -p "jpg_$L"
# mkdir -p "jpg_$M"
# mkdir -p "jpg_$S"

for pdf_file in UNI11VER*000.pdf; do
  pngL=png_$L/$(echo "$pdf_file" | sed -r "s/UNI11VER.{6}(..)000.pdf/universitas-$YEAR-$ISSUE-page-\1.png/")
  jpgL=$(echo "$pngL" | sed -r s/png/jpg/g)
  jpgM=$(echo "$jpgL" | sed -r s/"$L"/"$M"/g)
  jpgS=$(echo "$jpgL" | sed -r s/"$L"/"$S"/g)

  if [[ -e "$pgnL" || "$pdf_file" -nt "$pngL" ]]; then
  # echo "$pdf_file" "$pngL"
    convert \
      -density 160 \
      -colorspace CMYK \
      "$pdf_file"\
      -background white \
      -flatten \
      -resize "$L"x \
      -format png \
      -colorspace sRGB \
      "$pngL"

    # convert "$pngL" -format jpg "$jpgL"
    # convert "$pngL" -format jpg -resize "$M"x "$jpgM"
    # convert "$pngL" -format jpg -resize "$S"x "$jpgS"
  fi
done
