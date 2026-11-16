#!/usr/bin/env python3
"""TEST276 — Read-only, append-only backup of SpotySid PUBLIC community playlists.

Fetches the Cloudflare Worker public GET API; no beta key, Cloudflare token or
other publish/delete credential. Writes immutable content-addressed JSON files
into the Git repository, so a leaked beta key cannot delete historical copies.
GitHub Actions commits these records every six hours.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_API = "https://ricos-sid-community.serigrafiamdp.workers.dev"
REPO_ROOT = Path(__file__).resolve().parents[1]
PLAYLIST_ID = re.compile(r"^[a-z0-9-]{12,48}$")
MAX_CATALOG_BYTES = 2_000_000
MAX_PLAYLIST_BYTES = 4_000_000
MAX_RESULTS = 500  # Existing Worker GET /playlists hard-limits to 500.
AGENT = "SpotySid-Community-Backup/1.0"


def fetch_json(url: str, max_bytes: int) -> dict:
    """Fail closed after retries: never archive incomplete server responses."""
    last_error = None
    for attempt in range(3):
        try:
            req = Request(url, headers={
                "User-Agent": AGENT,
                "Accept": "application/json",
                "Cache-Control": "no-cache",
            })
            with urlopen(req, timeout=30) as response:
                if response.status != 200:
                    raise RuntimeError(f"Unexpected HTTP {response.status}: {url}")
                data = response.read(max_bytes + 1)
            if len(data) > max_bytes:
                raise RuntimeError(f"API payload exceeds backup limit: {url}")
            value = json.loads(data.decode("utf-8"))
            if not isinstance(value, dict):
                raise ValueError(f"API did not return a JSON object: {url}")
            return value
        except (HTTPError, URLError, TimeoutError, ValueError, OSError, RuntimeError) as exc:
            last_error = exc
            if attempt < 2:
                time.sleep(attempt + 1)
    raise RuntimeError(f"Backup refused: API request failed: {url}: {last_error}")


def validate_catalog(catalog: dict) -> list[dict]:
    if catalog.get("format") != "ricos-community-catalog":
        raise ValueError("Unexpected community catalog format")
    rows = catalog.get("playlists")
    if not isinstance(rows, list):
        raise ValueError("Missing community playlists")
    # A zero-item response or a full unpaginated result could erase evidence
    # of many existing lists; refuse to mark it as a successful complete run.
    if not rows:
        raise ValueError("Zero public playlists: refusing an empty backup")
    if len(rows) >= MAX_RESULTS:
        raise ValueError("Catalog reached 500-row API limit: add pagination before backup")
    seen = set()
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("Invalid catalog row")
        ident = row.get("id")
        if not isinstance(ident, str) or not PLAYLIST_ID.fullmatch(ident):
            raise ValueError("Invalid community playlist ID")
        if ident in seen:
            raise ValueError("Duplicate playlist ID in catalog")
        seen.add(ident)
        if not isinstance(row.get("tracks"), int) or row["tracks"] < 1:
            raise ValueError(f"Missing or empty playlist in catalog: {ident}")
    return rows


def validate_playlist(playlist: dict, entry: dict) -> None:
    ident = entry["id"]
    if playlist.get("format") != "ricos-sid-playlist" or playlist.get("id") != ident:
        raise ValueError(f"Unexpected playlist content or ID: {ident}")
    if playlist.get("version") not in (1, 2):
        raise ValueError(f"Unrecognized public playlist version: {ident}")
    songs = playlist.get("tracks")
    if not isinstance(songs, list) or not songs:
        raise ValueError(f"Empty playlist data: {ident}")
    if len(songs) != entry["tracks"]:
        raise ValueError(f"Catalog changed mid-backup: {ident}; retry next run")
    if not all(isinstance(song, dict) for song in songs):
        raise ValueError(f"Invalid SID reference: {ident}")


def canonical(value: dict) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True,
                       separators=(",", ":")) + "\n").encode("utf-8")


def most_recent_manifest(base: Path):
    paths = sorted((base / "runs").glob("*.json"))
    if not paths:
        return None
    try:
        value = json.loads(paths[-1].read_text(encoding="utf-8"))
        if value.get("format") == "spotysid-backup-manifest":
            return value
    except (ValueError, OSError):
        pass
    raise ValueError(f"Unreadable prior backup manifest: {paths[-1]}")


def save_file(path: Path, value: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() != value:
            raise ValueError(f"Backup hash collision or overwritten file: {path}")
        return False
    temporary = path.with_name(path.name + ".part")
    temporary.write_bytes(value)
    os.replace(temporary, path)
    return True


def run(api: str, root: Path) -> dict:
    if not api.startswith("https://") and not api.startswith("http://127.0.0.1:"):
        raise ValueError("Backup source must be HTTPS, except local test fixtures")
    base = root / "backups" / "community"
    catalog = validate_catalog(fetch_json(api.rstrip("/") + "/playlists", MAX_CATALOG_BYTES))
    # Retrieve and validate EVERYTHING before touching backup storage.
    records = []
    for item in catalog:
        ident = item["id"]
        data = fetch_json(api.rstrip("/") + "/playlists/" + ident, MAX_PLAYLIST_BYTES)
        validate_playlist(data, item)
        encoded = canonical(data)
        digest = hashlib.sha256(encoded).hexdigest()
        records.append((ident, len(data["tracks"]), digest, encoded))
    now = datetime.now(timezone.utc)
    stamp = now.strftime("%Y%m%dT%H%M%S%fZ")
    previous = most_recent_manifest(base)
    previous_ids = set(previous.get("playlists", {})) if previous else set()
    current_ids = {ident for ident, _, _, _ in records}
    missing = sorted(previous_ids - current_ids)
    # These IDs may have been deleted; keep every version in Git, forever.
    new_versions = 0
    for ident, tracks, digest, encoded in records:
        target = base / "versions" / ident / (digest + ".json")
        if save_file(target, encoded):
            new_versions += 1
    manifest = {
        "format": "spotysid-backup-manifest",
        "version": 1,
        "createdAt": now.isoformat(),
        "source": api.rstrip("/"),
        "playlistCount": len(records),
        "newVersions": new_versions,
        "missingSincePreviousRun": missing,
        "playlists": {
            ident: {"sha256": digest, "tracks": tracks}
            for ident, tracks, digest, _ in records
        },
    }
    save_file(base / "runs" / (stamp + ".json"), canonical(manifest))
    summary = (f"BACKUP OK: {len(records)} public playlists, "
               f"{new_versions} new versions, {len(missing)} missing IDs")
    print(summary)
    if missing:
        print("::warning::PUBLIC PLAYLISTS MISSING SINCE LAST BACKUP: " + ", ".join(missing))
    gh_summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if gh_summary:
        with open(gh_summary, "a", encoding="utf-8") as stream:
            stream.write(f"### SpotySid community backup\n\n{summary}\n\n")
            if missing:
                stream.write("**Missing (previous versions preserved):** " +
                             ", ".join(missing) + "\n\n")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--api-base", default=DEFAULT_API)
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT)
    args = parser.parse_args()
    try:
        run(args.api_base, args.repo_root)
    except Exception as exc:
        print(f"::error::SpotySid backup FAILED, old copies retained: {exc}", file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
