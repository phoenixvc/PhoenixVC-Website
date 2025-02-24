#!/bin/bash
# Final Git Tree Status Script – With Directory Heuristics (Normalized Paths) and Commit Suggestions
#
# Overview:
# 1. Builds a status_map from "git status --porcelain -z -M" (keys relative to TARGET_DIR).
#    For renamed files, the new filename is used.
#
# 2. Builds an existed_dirs map from "git ls-tree --name-only -r HEAD" (keys relative to REPO_ROOT),
#    then converts it to existed_dirs_rel (keys relative to TARGET_DIR) so we know which directories existed.
#
# 3. Prints the output of "git status" (from REPO_ROOT) at the top.
#
# 4. Prints the branch from REPO_ROOT down to TARGET_DIR (without markers on intermediate nodes).
#
# 5. Recursively prints the on‑disk tree of TARGET_DIR (skipping git‑ignored files):
#    - Files get their marker from status_map (or, if untracked, marked as [+]).
#    - Directories use get_directory_marker(), which (using existed_dirs_rel)
#      returns:
#         • If the directory did not exist in HEAD → [+]
#         • If it existed and at least one child (from status_map) is non‑deleted → [M]
#         • If it existed and all tracked children are deletions → [D]
#
# 6. After printing on‑disk items in a directory, any remaining keys in status_map (virtual deleted items)
#    whose normalized parent equals the current directory are printed as [D].
#
# 7. At the very end, a commit suggestion section is printed.
#
# Markers (colors):
#    [M] – yellow (modified)
#    [D] – red    (deleted)
#    [+] – green  (added/untracked)
#    [R] – magenta (renamed)
#
# Requirements: GNU realpath, Bash 4+
#
# Usage: ./git-tree-status.sh <target-directory>

# Colors
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# --- Setup and Validation ---
if [ -z "$1" ]; then
    echo "Usage: $0 <target-directory>"
    exit 1
fi

if [ ! -d "$1" ]; then
    echo "Error: Directory '$1' does not exist."
    exit 1
fi

TARGET_DIR=$(realpath "$1")
REPO_ROOT=$(git -C "$TARGET_DIR" rev-parse --show-toplevel)
REL_TARGET=$(realpath --relative-to="$REPO_ROOT" "$TARGET_DIR")
if [ -z "$REL_TARGET" ]; then
    REL_TARGET="."
fi

# --- Print Git Status at Top ---
echo "==== git status ===="
git -C "$REPO_ROOT" status
echo "===================="
echo ""

# --- Build status_map (keys relative to TARGET_DIR) ---
declare -A status_map
pushd "$TARGET_DIR" > /dev/null || exit 1
while IFS= read -r -d $'\0' line; do
    status="${line:0:2}"
    filepath="${line:3}"
    filepath="${filepath#./}"
    if [[ "$status" =~ ^R ]]; then
         newfile=$(echo "$filepath" | awk -F ' -> ' '{print $2}')
         status_map["$newfile"]="$status"
    else
         status_map["$filepath"]="$status"
    fi
done < <(git status --porcelain -z -M)
popd > /dev/null

# --- Build existed_dirs (directories relative to REPO_ROOT that existed in HEAD) ---
declare -A existed_dirs
while IFS= read -r file; do
    dir=$(dirname "$file")
    if [ "$dir" == "." ]; then
         dir="."
    fi
    existed_dirs["$dir"]=1
done < <(git -C "$REPO_ROOT" ls-tree --name-only -r HEAD)

# Convert existed_dirs to existed_dirs_rel (keys relative to TARGET_DIR).
declare -A existed_dirs_rel
for key in "${!existed_dirs[@]}"; do
    if [ "$REL_TARGET" == "." ]; then
        existed_dirs_rel["$key"]=1
    else
        if [[ "$key" == "$REL_TARGET/"* ]]; then
            newkey=${key#"$REL_TARGET/"}
            if [ -z "$newkey" ]; then
                newkey="."
            fi
            existed_dirs_rel["$newkey"]=1
        fi
    fi
done

# --- Helper Functions ---

# get_marker: Convert a Git status code into a colored marker.
get_marker() {
    local code="$1"
    case "$code" in
         "D " | " D")
              echo -e "${RED}[D]${NC}"
              ;;
         "M " | " M")
              echo -e "${YELLOW}[M]${NC}"
              ;;
         "??")
              echo -e "${GREEN}[+]${NC}"
              ;;
         R*)
              echo -e "${MAGENTA}[R]${NC}"
              ;;
         *)
              echo ""
              ;;
    esac
}

# is_new_directory: Returns 0 if no tracked file exists under the given directory (absolute path).
is_new_directory() {
    local dir="$1"
    if [ -z "$(git -C "$TARGET_DIR" ls-files "$dir")" ]; then
         return 0
    else
         return 1
    fi
}

# normalized_dir: Given a relative path, return its dirname (using "." for root).
normalized_dir() {
    local path="$1"
    local d
    d=$(dirname "$path")
    if [ "$d" == "." ]; then
         echo "."
    else
         echo "$d"
    fi
}

# get_directory_marker: Given a directory path relative to TARGET_DIR (dir_rel),
# decide its marker using existed_dirs_rel and status_map.
get_directory_marker() {
    local dir_rel="$1"  # e.g. "src/theme/constants"
    # If the directory did not exist in HEAD (relative to TARGET_DIR), mark as added.
    if [ -z "${existed_dirs_rel[$dir_rel]}" ]; then
         echo -e "${GREEN}[+]${NC}"
         return
    fi
    local non_deleted=0
    local has_deleted=0
    for key in "${!status_map[@]}"; do
         if [[ "$key" == "$dir_rel/"* ]]; then
              local st="${status_map[$key]}"
              if [[ "$st" == "D " || "$st" == " D" ]]; then
                   has_deleted=1
              else
                   non_deleted=1
              fi
         fi
    done
    if [ $non_deleted -eq 1 ]; then
         echo -e "${YELLOW}[M]${NC}"
    elif [ $has_deleted -eq 1 ]; then
         echo -e "${RED}[D]${NC}"
    else
         echo ""
    fi
}

# print_virtual_items: For the current directory (current_rel relative to TARGET_DIR),
# print any remaining keys in status_map whose normalized parent equals current_rel.
print_virtual_items() {
    local current_rel="$1"
    local indent="$2"
    for key in "${!status_map[@]}"; do
         local par
         par=$(normalized_dir "$key")
         if [ "$par" == "$current_rel" ]; then
              local marker
              marker=$(get_marker "${status_map[$key]}")
              echo -e "${indent}└── $marker $(basename "$key")"
              unset status_map["$key"]
         fi
    done
}

# print_branch: Print the branch from REPO_ROOT down to TARGET_DIR (without markers).
print_branch() {
    echo "$(basename "$REPO_ROOT")/"
    if [ -n "$REL_TARGET" ]; then
         IFS='/' read -ra parts <<< "$REL_TARGET"
         local indent=""
         for part in "${parts[@]}"; do
              echo -e "${indent}└── $part/"
              indent+="    "
         done
    fi
}

# print_tree: Recursively print the tree for a given relative path (relative to TARGET_DIR).
print_tree() {
    local current_rel="$1"   # "" means TARGET_DIR itself.
    local indent="$2"
    local current_abs="$TARGET_DIR"
    if [ -n "$current_rel" ]; then
         current_abs="$TARGET_DIR/$current_rel"
    fi

    local items=()
    while IFS= read -r -d $'\0' item; do
         local rel_item
         rel_item=$(realpath --relative-to="$TARGET_DIR" "$item")
         if git -C "$TARGET_DIR" check-ignore "$rel_item" >/dev/null 2>&1; then
              continue
         fi
         items+=("$(basename "$item")")
    done < <(find "$current_abs" -maxdepth 1 -mindepth 1 -not -name ".git" -print0 2>/dev/null | sort -z)

    local count=${#items[@]}
    local i=0
    for name in "${items[@]}"; do
         ((i++))
         local connector
         if [ $i -eq $count ]; then
              connector="└──"
         else
              connector="├──"
         fi
         local item_rel
         if [ -z "$current_rel" ]; then
              item_rel="$name"
         else
              item_rel="$current_rel/$name"
         fi

         local marker=""
         if [ -d "$TARGET_DIR/$item_rel" ]; then
              marker=$(get_directory_marker "$item_rel")
         else
              if [ -n "${status_map[$item_rel]}" ]; then
                   marker=$(get_marker "${status_map[$item_rel]}")
              else
                   if [ -z "$(git -C "$TARGET_DIR" ls-files "$item_rel")" ]; then
                        marker=$(echo -e "${GREEN}[+]${NC}")
                   fi
              fi
         fi

         if [ -d "$TARGET_DIR/$item_rel" ]; then
              echo -e "${indent}${connector} $marker $name/"
              unset status_map["$item_rel"]
              local new_indent="$indent"
              if [ "$connector" == "└──" ]; then
                   new_indent+="    "
              else
                   new_indent+="│   "
              fi
              print_tree "$item_rel" "$new_indent"
         else
              echo -e "${indent}${connector} $marker $name"
              unset status_map["$item_rel"]
         fi
    done

    print_virtual_items "$current_rel" "$indent"
}

# --- Main Execution ---
print_branch

initial_indent=""
if [ -n "$REL_TARGET" ]; then
    depth=$(echo "$REL_TARGET" | awk -F/ '{print NF}')
    for ((j=0; j<depth; j++)); do
         initial_indent+="    "
    done
fi

print_tree "" "$initial_indent"

# --- Commit Suggestions Section ---
echo ""
echo "========================================"
echo "Commit Suggestions:"
echo ""
echo "### Group your changes and commit them with conventional commit messages:"
echo " - :sparkles: **feat:** For new additions. (e.g. \"feat: add new theme tokens\")"
echo " - :hammer: **refactor:** For modifications. (e.g. \"refactor: update theme utilities\")"
echo " - :bug: **fix:** For corrections to broken or missing functionality. (e.g. \"fix: remove deleted files\")"
echo " - :wastebasket: **chore:** For deletions or removals. (e.g. \"chore: remove unused theme components\")"
echo ""
echo "Review the above git status and tree structure, then group and commit your changes accordingly."
echo ""
echo "For the AI:"
echo "Create -no-verify commit commands for each logical grouping, including main changes as bullet points"
echo "========================================"
