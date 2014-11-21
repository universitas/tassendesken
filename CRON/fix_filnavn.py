#! /usr/bin/python
# -*- coding: utf-8 -*-
import re
import shutil
import sys
from unidecode import unidecode
# import os

# Husk at folder må være en unicode-string for at filnavn også skal være det.
# WATCH_FOLDER = u'/div/platon/universitas-f2/UTTEGNER/CRON/'


for myfile in sys.argv[1:]:
    myfile = unicode(myfile)
    nytt_navn = unidecode(myfile)
    nytt_navn = re.sub('[_\-\s]+', '-', nytt_navn)
    # shutil.move(myfile, nytt_navn)
    print nytt_navn
