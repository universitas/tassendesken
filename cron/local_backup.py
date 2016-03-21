#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
Run nightly to backup latest issue to local backup disk.

Dependencies:
    pysftp
Example:
    add this to crontab (crontab -e) to run every day at 05:00
    0 5 * * * /uio/kant/div-universitas-desken/SCRIPTS/cron/local_backup.py
"""

from __future__ import print_function
from pysftp import Connection, WTCallbacks, reparent, path_advance, walktree
import datetime
import os

# Dette er backupdisken i hylla på universitas-kontoret
ARKIV_IP = '129.240.79.50'
ARKIV_LOGIN = 'dennis'
ARKIV_SHARE = 'arkiv'


def main():
    """Backup current issue over sftp to external backup device"""
    year = datetime.datetime.now().year
    desken = desken_folder()
    issue = find_current_issue(desken)
    print(desken, year, issue)
    archive_files_over_sftp(
        local_folder='%s/%s/' % (desken, issue),
        remote_folder='%s/%s/%s' % (ARKIV_SHARE, year, issue)
    )


def desken_folder():
    """Walk up the path tree to find desken folder"""
    this_file = os.path.abspath(__file__)
    up = os.path.dirname
    desken = up(up(up(this_file)))
    # desken = "/uio/kant/div-universitas-desken/"
    return desken


def find_current_issue(desken):
    """Find issue number based on which folder is the largest number"""
    folders = os.listdir(desken)
    try:
        latest_issue = max(folder for folder in folders if folder.isdigit())
    except ValueError:
        exit('No issue folder found in %s' % desken)
    return latest_issue


def archive_files_over_sftp(local_folder, remote_folder):
    """Connect to SFTP server and copy local folder recursively"""
    with Connection(
            ARKIV_IP, username=ARKIV_LOGIN, password=ARKIV_LOGIN) as sftp:
        sftp.makedirs(remote_folder)
        put_r(sftp, local_folder, remote_folder)


def put_r(self, localpath, remotepath, confirm=True, preserve_mtime=False):

    self._sftp_connect()
    wtcb = WTCallbacks()
    cur_local_dir = os.getcwd()
    os.chdir(localpath)
    walktree('.', wtcb.file_cb, wtcb.dir_cb, wtcb.unk_cb)
    os.chdir(cur_local_dir)
    for dname in wtcb.dlist:
        if dname != '.':
            pth = reparent(remotepath, dname)
            if not self.isdir(pth):
                self.mkdir(pth)

    for fname in wtcb.flist:
        head, _ = os.path.split(fname)
        if head not in wtcb.dlist:
            for subdir in path_advance(head):
                if subdir not in wtcb.dlist and subdir != '.':
                    self.mkdir(reparent(remotepath, subdir))
                    wtcb.dlist = wtcb.dlist + [subdir, ]
        src = os.path.join(localpath, fname)
        dest = reparent(remotepath, fname)
        if self.isfile(dest) and os.stat(src).st_mtime > self.stat(dest).st_mtime:
            continue
        print('put', src, dest, os.stat(src).st_mtime)
        self.put(src, dest, confirm=confirm, preserve_mtime=preserve_mtime)

if __name__ == '__main__':
    main()
