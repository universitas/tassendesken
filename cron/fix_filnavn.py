#! /usr/bin/env python
# -*- coding: utf-8 -*-
"""Recursively fix filenames to web friendly ascii instead of unicode"""
from __future__ import print_function
import re
import shutil
import sys
import os
from unidecode import unidecode


def walk(filename):
    if not os.path.exists(filename):
        exit(u'File not found: %s' % filename)
    branch, leaf = os.path.split(os.path.abspath(filename))
    filename = rename(branch, leaf, unidecode_filename(leaf))

    if os.path.isdir(filename):
        for branch, _, leaves in os.walk(filename, topdown=False):
            root, dirname = os.path.split(branch)
            branch = rename(root, dirname, unidecode_filename(dirname))
            for leaf in leaves:
                rename(branch, leaf, unidecode_filename(leaf))


def rename(root, old, new):
    old_path = os.path.join(root, old)
    new_path = os.path.join(root, new)
    if old.startswith('~'):
        return old_path
    if new_path != old_path:
        while os.path.exists(new_path):
            new = '0' + new
            new_path = os.path.join(root, new)
        try:
            shutil.move(old_path, new_path)
        except OSError as ex:
            pass

    return new_path


def unidecode_filename(filename):
    filename = filename.decode('utf-8')
    new_name = unidecode(filename)
    new_name = re.sub(r'[^A-Za-z0-9.]+', '-', new_name)
    new_name = new_name.strip('-')
    new_name = re.sub(r'-?\.-?', '.', new_name)
    new_name = re.compile(r'-*\.jpe?g', re.I).sub(u'.jpg', new_name)
    new_name = re.compile(r'-*\.png', re.I).sub(u'.png', new_name)
    return new_name.encode('utf-8')


def byline_format(full_path):
    folder, filename = os.path.split(full_path)
    filename = filename.title()
    filename = unidecode_filename(filename)
    return os.path.join(folder, filename)

if __name__ == '__main__':
    for filename in sys.argv[1:]:
        walk(filename)
