#!/bin/bash
# Final Git Tree Status Script – With Directory Heuristics
#
# This script builds:
# 1. A status_map from "git status --porcelain -z -M" (keys relative to TARGET_DIR).
#    Renamed files are keyed by their new name.
# 2. An existed_dirs map (directories that existed in HEAD) from "git ls-tree --name-only -r HEAD".
#
# When printing the tree:
# - Files are printed with their status marker:
#      [M] – modified (yellow)
#      [D] – deleted (red; virtual, not on disk)
#      [+] – added/untracked (green)
#      [R] – renamed (magenta)
# - Directories are given a marker via get_directory_marker():
#      • If the directory did not exist in HEAD → [+]
#      • If it existed in HEAD and has any child (even added ones) → [M]
#      • If it existed and all tracked children are deleted → [D]
#
# After printing on-disk items in a directory, any remaining keys in status_map
# (virtual deleted files) whose normalized parent equals the current directory are printed.
#
# The branch from REPO_ROOT to TARGET_DIR is printed once at the top.
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

# --- Setup ---
if [ -z "$1" ]; then
    echo "Usage: $0 <target-directory>"
    exit 1
fi

TARGET_DIR=$(realpath "$1")
REPO_ROOT=$(git -C "$TARGET_DIR" rev-parse --show-toplevel)
REL_TARGET=$(realpath --relative-to="$REPO_ROOT" "$TARGET_DIR")

# Build status_map (keys relative to TARGET_DIR).
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

# Build existed_dirs: directories (relative to REPO_ROOT) that existed in HEAD.
declare -A existed_dirs
while IFS= read -r file; do
    dir=$(dirname "$file")
    if [ "$dir" == "." ]; then
         dir=""
    fi
    existed_dirs["$dir"]=1
done < <(git -C "$REPO_ROOT" ls-tree --name-only -r HEAD)

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

# normalized_dir: Given a relative path, return its dirname (with "." replaced by an empty string).
normalized_dir() {
    local path="$1"
    local d
    d=$(dirname "$path")
    if [ "$d" == "." ]; then
         echo ""
    else
         echo "$d"
    fi
}

# get_directory_marker: Given a full directory path (relative to REPO_ROOT), decide its marker.
# Heuristic:
#  - If the directory did not exist in HEAD (not in existed_dirs), mark as added ([+]).
#  - If it existed, then scan status_map for any keys that begin with "full_dir/".
#       • If any such key is present with a non-deleted status, mark as modified ([M]).
#       • If keys are present but all have deletion statuses, mark as deleted ([D]).
#       • If no keys are found, return empty.
get_directory_marker() {
    local full_dir="$1"  # e.g. "apps/web/src/theme/components"
    if [ -z "${existed_dirs[$full_dir]}" ]; then
         # Directory did not exist before → added.
         echo -e "${GREEN}[+]${NC}"
         return
    fi
    local non_deleted=0
    local has_deleted=0
    for key in "${!status_map[@]}"; do
         # We want keys that start with full_dir/ (note the trailing slash).
         if [[ "$key" == "$full_dir/"* ]]; then
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

# print_virtual_items: For the current directory (current_rel, relative to TARGET_DIR),
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

# print_branch: Print the branch from REPO_ROOT to TARGET_DIR (without markers).
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

    # List on-disk items in current_abs (skip .git and gitignored files).
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
              # Compute full directory path relative to REPO_ROOT.
              local full_dir
              if [ -n "$REL_TARGET" ]; then
                   if [ -n "$current_rel" ]; then
                        full_dir="$REL_TARGET/$current_rel/$name"
                   else
                        full_dir="$REL_TARGET/$name"
                   fi
              else
                   full_dir="$name"
              fi
              marker=$(get_directory_marker "$full_dir")
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

    # After printing on-disk items, print any remaining virtual (deleted) items for current_rel.
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
