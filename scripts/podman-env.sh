# Source this file. It sets a stable podman environment for this project.
# XDG_RUNTIME_DIR: crun keeps container state in $XDG_RUNTIME_DIR/crun. The default value on the box
# is a desktop-session dir (/tmp/xdg-runtime-box-N). The box deletes it when that session ends, and
# every later "podman exec" in a running sandbox fails ("crun: error opening file .../status").
# So use a dir that belongs to this loop only.
_repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export XDG_RUNTIME_DIR=/tmp/xdg-runtime-gosciniec-www
mkdir -p "$XDG_RUNTIME_DIR" && chmod 700 "$XDG_RUNTIME_DIR"
export CONTAINERS_STORAGE_CONF="$_repo/.sandcastle/podman-storage.conf"
unset DBUS_SESSION_BUS_ADDRESS _repo
