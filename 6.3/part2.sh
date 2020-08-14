# Make a branch, add and commit onto it, and merge it back into "master"
# -- create git repo + master branch --
mkdir merging; cd merging
git init

# -- initial commit --
echo This is a test from Speakonia. > text.txt
git add text.txt
git commit -m "Adding \"text.txt\""

# -- separate branch --
git checkout -b snstruthers
cat "Newline" | cat text.txt - > text.txt
git commit -m "Modified \"text.txt\"" text.txt

# -- merge into "master" --
git checkout master
git merge snstruthers

# -- step 1 of merge conflict --
git checkout snstruthers
cat "Step 1" | cat text.txt - > text.txt
git add .
git commit -m "Changed \"text.txt\" again :^)"

# -- step 2 of merge conflict --
git checkout master
cat "Step 2" | cat text.txt - > text.txt
git add .
git commit -m "Further modified \"text.txt\""
git merge snstruthers

