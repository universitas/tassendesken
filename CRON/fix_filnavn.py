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
    path = myfile.split('/')
    new_name = unidecode(path[-1].decode('utf-8'))
    path[-1] = re.sub('[^\w.]+', '-', new_name)
    new_path = '/'.join(path)
    if new_path != myfile:
        shutil.move(myfile, new_path)
    print path[-1]
