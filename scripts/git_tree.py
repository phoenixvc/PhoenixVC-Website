#!/usr/bin/env python3
import sys
import os
from collections import defaultdict

def tree():
    return defaultdict(tree)

def insert_path(t, path):
    parts = path.strip().split(os.sep)
    for part in parts:
        t = t[part]

def print_tree(t, prefix=""):
    keys = sorted(t.keys())
    for i, key in enumerate(keys):
        is_last = (i == len(keys) - 1)
        if is_last:
            print(prefix + "└── " + key)
            new_prefix = prefix + "    "
        else:
            print(prefix + "├── " + key)
            new_prefix = prefix + "│   "
        print_tree(t[key], new_prefix)

if __name__ == '__main__':
    t = tree()
    for line in sys.stdin:
        line = line.strip()
        if line:
            insert_path(t, line)
    print_tree(t)