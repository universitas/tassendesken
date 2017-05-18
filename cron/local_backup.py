#!/usr/bin/python -u
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
import os, sys

# Dette er backupdisken i hylla på universitas-kontoret
HOST = '129.240.79.50'
LOGIN = 'dennis'
ROOTDIR = 'arkiv'
FILETYPES = ['.jpg', '.png', '.ai', '.indd', '.pdf', '.jpeg', '.tif', '.png', '.svg']


def main():
    """Backup current issue over sftp to external backup device"""
    year = datetime.datetime.now().year
    desken = desken_folder()
    if len(sys.argv) > 1:
        issues = sys.argv[1:]
    else:
        issues = [find_current_issue(desken)]
    for issue in issues:
        print(desken, year, issue)
        archive_files_over_sftp(
            local_folder='%s/%s/' % (desken, issue),
            remote_folder='%s/%s/%s' % (ROOTDIR, year, issue)
        )
        print('\ndone\n')


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

def delete_remote_dir(remote_folder):
    with Connection(HOST, username=LOGIN, password=LOGIN) as sftp:
        rm_r(sftp, remote_folder)

def archive_files_over_sftp(local_folder, remote_folder):
    """Connect to SFTP server and copy local folder recursively"""
    # import ipdb; ipdb.set_trace()
    with Connection(HOST, username=LOGIN, password=LOGIN) as sftp:
        sftp.makedirs(remote_folder)
        put_r(sftp, local_folder, remote_folder)

def rm_r(sftp, path):
    """Recursive delete remote path"""
    print('deleting: %s' % path)
    if sftp.isfile(path):
        sftp.remove(path)
    elif sftp.isdir(path):
        files = sftp.listdir(path)
        for f in files:
            rm_r(sftp, os.path.join(path, f))
        sftp.rmdir(path)
    else:
        print('no such file: %s' % path)

def put_r(sftp, localpath, remotepath, confirm=True, preserve_mtime=True):
    """Recursive put of files over sftp"""

    sftp._sftp_connect()
    wtcb = WTCallbacks()
    cur_local_dir = os.getcwd()
    os.chdir(localpath)
    walktree('.', wtcb.file_cb, wtcb.dir_cb, wtcb.unk_cb)
    os.chdir(cur_local_dir)
    for dname in wtcb.dlist:
        if dname != '.':
            pth = reparent(remotepath, dname)
            if not sftp.isdir(pth):
                sftp.mkdir(pth)

    for fname in wtcb.flist:
        head, _ = os.path.split(fname)
        if head not in wtcb.dlist:
            for subdir in path_advance(head):
                if subdir not in wtcb.dlist and subdir != '.':
                    sftp.mkdir(reparent(remotepath, subdir))
                    wtcb.dlist = wtcb.dlist + [subdir, ]
        src = os.path.join(localpath, fname)
        dest = reparent(remotepath, fname)
        if os.path.splitext(src)[1] not in FILETYPES:
            print('skip filetype %s' % src)
            continue
        if sftp.isfile(dest):
            src_mtime = int(os.stat(src).st_mtime)
            dest_mtime = int(sftp.stat(dest).st_mtime)
            if src_mtime <= dest_mtime:
                print('no change     %s' % src)
                continue
            else:
                print('changed %s < %s' % (dest_mtime, src_mtime), end=': ')
        print('put           %s => %s' % (src, dest))
        sftp.put(src, dest, confirm=confirm, preserve_mtime=preserve_mtime)

if __name__ == '__main__':
    main()
