#!/bin/sh

function press_key() {
    printf "Press any key to continue..."
	read
}

# Create a folder called "learn_git_again"
mkdir learn_git_again

# cd into "learn_git_again"
cd learn_git again

# Create a file called "third.txt"
touch third.txt

# Initialize an empty git repo
git init

# Add "third.txt" to the staging area
git add third.txt

# Commit
git commit -m "Adding \"third.txt\""

# Check out your commit with `git log`
git log
press_key

# Create another file called "fourth.txt"
touch fourth.txt

# Add "fourth.txt" to staging area
git add fourth.txt

# Commit
git commit -m "Adding \"fourth.txt\""

# Remove "third.txt"
rm third.txt

# Add this change to the staging area
git rm third.txt

# Commit
git commit -m "Removing \"third.txt\""

# Check out your commits with `git log`
git log
press_key

# Change global setting "core.pager" to cat
git config --global core.pager cat

# List all global configurations for git on your machine
git config --global -l
press_key

