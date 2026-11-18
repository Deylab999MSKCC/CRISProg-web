#!/bin/bash
# Downloads the IGVF cardiomyocyte TF Perturb-seq files (analysis set IGVFDS6332VCTO) into raw/ (~76 GB) and checks
# them against the portal's md5 sums. Re-running resumes partial downloads and skips finished ones.
# Usage (in an empty folder):  bash download.sh
set -euo pipefail
mkdir -p raw
P=https://api.data.igvf.org
get() {   # portal path, expected size in bytes
  local out=raw/$(basename "$1") size
  size=$(stat -c %s "$out" 2>/dev/null || stat -f %z "$out" 2>/dev/null || echo 0)
  if [[ "$size" == "$2" ]]; then echo "$out already complete"; return; fi
  echo "downloading $out ($2 bytes)"
  curl -sSfL --retry 10 --retry-delay 30 -C - -o "$out" "$P$1"
}
get /matrix-files/IGVFFI3617IJOW/@@download/IGVFFI3617IJOW.h5 4637259965      # filtered cells x genes UMI (Cell Ranger)
get /matrix-files/IGVFFI4735RXPI/@@download/IGVFFI4735RXPI.pkl 71135508430    # guides x cells UMI (pandas pickle)
get /tabular-files/IGVFFI8270UPKB/@@download/IGVFFI8270UPKB.csv.gz 348103     # guide library
cat > raw/md5_expected.txt <<'MD5'
fc733891a78752547bf6b688ae7215d1  raw/IGVFFI3617IJOW.h5
c8275e6aec76e47e212d97159f109e18  raw/IGVFFI4735RXPI.pkl
766b1fd06fe7d641104d2569a735a63f  raw/IGVFFI8270UPKB.csv.gz
MD5
md5sum -c raw/md5_expected.txt     # never unpickle a file whose md5 differs from the portal's
