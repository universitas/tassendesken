#! /bin/bash

pdf_folder="/home/haakenlid/Desktop/PDF"
year=$(date +"%Y")
issue=19

cd "$pdf_folder"
mkdir -p png1200 jpg1200 jpg500 jpg150

for pdf_file in UNI11VER*000.pdf; do
  pngL=png1200/$(echo "$pdf_file" | sed -r "s/UNI11VER.{6}(..)000.pdf/Universitas-$year-$issue-side-\1.png/")
  jpgL=$(echo "$pngL" | sed -r "s/png/jpg/g")
  jpgM=$(echo "$jpgL" | sed -r "s/1200/500/g")
  jpgS=$(echo "$jpgL" | sed -r "s/1200/150/g")
  # echo "$jpgL $jpgM $jpgS"
  if [[ -e "$pgnL" || "$pdf_file" -nt "$pngL" ]]; then
  echo "$pdf_file" "$pngL"
    convert \
      -density 160 \
      "$pdf_file"\
      -background white \
      -flatten \
      -resize 1200x \
      -format png \
      "$pngL"

    convert "$pngL" -format jpg "$jpgL"
    convert "$pngL" -format jpg -resize 500x "$jpgM"
    convert "$pngL" -format jpg -resize 150x "$jpgS"
  fi
done