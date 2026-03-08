#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick installation test script
Run this to verify all dependencies are installed correctly
"""

import sys
import io

# Set UTF-8 encoding for output on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing package imports...")

    packages = [
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('socketio', 'Python Socket.IO'),
        ('aiohttp', 'aiohttp'),
    ]

    failed = []

    for package, name in packages:
        try:
            __import__(package)
            print(f"  [OK] {name}")
        except ImportError:
            print(f"  [FAIL] {name} - NOT FOUND")
            failed.append(name)

    return failed

def test_files():
    """Test if all required files exist"""
    print("\nTesting file structure...")

    import os

    required_files = [
        'app.py',
        'requirements.txt',
        'README.md',
        'static/index.html',
        'static/game.html',
        'static/style.css',
        'static/app.js',
        'static/game.js',
        'static/dartboard.js',
    ]

    missing = []

    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"  [OK] {file_path}")
        else:
            print(f"  [FAIL] {file_path} - NOT FOUND")
            missing.append(file_path)

    return missing

def test_python_version():
    """Test Python version"""
    print("\nTesting Python version...")

    version = sys.version_info
    print(f"  Python {version.major}.{version.minor}.{version.micro}")

    if version.major >= 3 and version.minor >= 8:
        print("  [OK] Python version is compatible")
        return True
    else:
        print("  [FAIL] Python 3.8+ required")
        return False

def main():
    print("=" * 50)
    print("Darts Game Installation Test")
    print("=" * 50)

    # Test Python version
    python_ok = test_python_version()

    # Test imports
    failed_imports = test_imports()

    # Test files
    missing_files = test_files()

    # Summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)

    if python_ok and not failed_imports and not missing_files:
        print("\n[SUCCESS] All tests passed!")
        print("\nYou can now run the game:")
        print("  python app.py")
        print("\nThen open: http://localhost:8000")
        return 0
    else:
        print("\n[ERROR] Some tests failed:")

        if not python_ok:
            print("  - Python version not compatible (need 3.8+)")

        if failed_imports:
            print(f"  - Missing packages: {', '.join(failed_imports)}")
            print("\n  Fix: pip install -r requirements.txt")

        if missing_files:
            print(f"  - Missing files: {', '.join(missing_files)}")

        return 1

if __name__ == '__main__':
    sys.exit(main())
