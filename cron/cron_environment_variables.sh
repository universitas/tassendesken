#!/bin/bash
# Set environmental variables for cron jobs.

# bash input field seperator

function logger() {
  # add a timestamp to each line from stdin and write to the file $1
  while IFS= read -r line; do
    echo "$(date +"[%Y-%m-%d %H:%M:%S]") $line" >> $1
  done
}

IFS=$'\n'

# paths for local folders
# Universitasdesken @uio
DESKEN="/uio/kant/div-universitas-desken"

# Prodsys @uio
PRODSYS="/net/app-evs/w3-vh/no.uio.universitas_80/htdocs/bilder"

# Bash og python-script som skal kjøres automatisk.
SCRIPT_FOLDER="$DESKEN/SCRIPTS/cron"

# Mellomlagring av bilder og pdf-er som skal lastes opp til web.
STAGING="$DESKEN/STAGING"
IMAGE_FOLDER="$STAGING/IMAGES"
PDF_FOLDER="$STAGING/PDF"

# SSH login til webservere
REMOTE_LINODE="haakenlid@universitas.no:/srv/fotoarkiv_universitas"
REMOTE_DOMENESHOP="universitas@login.domeneshop.no:static/bilder"

# logfile
LOGFILE="$STAGING/collect.log"

# discover year and current issue number for Universitas.
YEAR=$(date +%Y)
ISSUE=$(ls $DESKEN/ | grep -e '^[0-9]\{1,3\}$' | sort -nr | head -n 1)
