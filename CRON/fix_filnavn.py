#! /usr/bin/python
# -*- coding: utf-8 -*-
import re, shutil
from unidecode import unidecode

# Husk at folder må være en unicode-string for at filnavn også skal være det.
WATCH_FOLDER = u'/div/platon/universitas-f2/UTTEGNER/CRON/'


import os
for myfile in os.listdir(WATCH_FOLDER):
    if myfile.endswith(".txt"):
        nytt_navn = unidecode(myfile)
        nytt_navn = re.sub('[_\-\s]+', '-', nytt_navn)
        shutil.move(myfile, nytt_navn)
        print nytt_navn