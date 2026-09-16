import os
import sys
import zipfile

OUTPUT_PATH = sys.argv[1] if len(sys.argv) > 1 else "/tmp/coab-media-operations-hub.zip"

EXCLUDE_DIRS = {
    "node_modules",
    "dist",
    ".git",
    ".cache",
    "__pycache__",
    ".vscode",
    ".idea",
}

EXCLUDE_FILES = {
    "package-lock.json.bak",
    ".DS_Store",
}

EXCLUDE_EXTS = {
    ".pyc",
    ".zip",
    ".log",
}

def create_zip(target_path):
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    with zipfile.ZipFile(target_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]
            for file in files:
                if file in EXCLUDE_FILES or any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)
                zf.write(full_path, rel_path)
    
    print(f"Created ZIP at {target_path} ({os.path.getsize(target_path)} bytes)")

if __name__ == "__main__":
    create_zip(OUTPUT_PATH)
