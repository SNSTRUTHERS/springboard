#!/bin/sh

# Make a directory called "first"
mkdir first

# Change directory to "first"
cd first

# Create a file called "person.txt"
touch person.txt

# Change the name of "person.txt" to "another.txt"
mv person.txt another.txt

# Make a copy of "another.txt" called "copy.txt"
cp another.txt copy.txt

# Remove "copy.txt"
rm copy.txt

# Make a copy of "first" and call it "second"
cp -r first second

# Delete "second"
rm -r second

