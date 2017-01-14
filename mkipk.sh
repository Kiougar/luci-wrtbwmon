#!/bin/bash
tmpdir=`mktemp -d`
rsync -avL package/ $tmpdir
fakeroot -- ipkg-build -c $tmpdir
rm -rf "$tmpdir"
