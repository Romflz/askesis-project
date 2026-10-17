import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const CARDS: CardContent[] = [
  // What each path is for
  {
    front: 'What is `/` for?',
    back: 'The root directory: the top of the single directory tree, where every absolute path starts.',
    extra: 'Not to be confused with `/root`, the root user’s home.',
  },
  {
    front: 'What is `/bin` for?',
    back: 'Essential commands for all users, needed even to boot and repair the system (`ls`, `cp`, `cat`).',
    extra: 'On current distributions it’s a symlink to `/usr/bin` (the usr merge).',
  },
  {
    front: 'What is `/sbin` for?',
    back: 'Essential system administration commands (`fsck`, `mkfs`, `reboot`).',
    extra: 'Mostly for root. A symlink to `/usr/sbin` on merged systems.',
  },
  {
    front: 'What is `/boot` for?',
    back: 'What’s needed to boot: the kernel (`vmlinuz`), the initramfs and the GRUB bootloader files.',
    extra: 'Often a small separate partition.',
  },
  {
    front: 'What is `/dev` for?',
    back: 'Device files: the interface to hardware and pseudo-devices (`/dev/sda`, `/dev/null`).',
    extra: 'Created dynamically by the kernel and udev as devices appear.',
  },
  {
    front: 'What is `/etc` for?',
    back: 'System-wide configuration files, in plain text.',
    extra: 'Host-specific and static: configuration only, no programs. `/etc/passwd`, `/etc/fstab`, `/etc/hosts`…',
  },
  {
    front: 'What is `/home` for?',
    back: 'The home directories of regular users, e.g. `/home/alice`.',
    extra: 'Often a separate partition or network share, so users’ data survives a reinstall.',
  },
  {
    front: 'What is `/root` for?',
    back: 'The home directory of the root user.',
    extra: 'Kept on the root filesystem, so it’s there even when `/home` isn’t mounted.',
  },
  {
    front: 'What is `/lib` for?',
    back: 'The essential shared libraries for the commands in `/bin` and `/sbin`, and the kernel modules (`/lib/modules`).',
    extra: '`/lib64` holds the 64-bit libraries on some distributions. A symlink to `/usr/lib` on merged systems.',
  },
  {
    front: 'What is `/media` for?',
    back: 'Mount points for removable media such as USB sticks and DVDs, usually created automatically.',
    extra: 'e.g. `/media/alice/USBSTICK`. Contrast `/mnt`, for manual mounts.',
  },
  {
    front: 'What is `/mnt` for?',
    back: 'A place for temporary filesystems the administrator mounts by hand.',
    extra: 'e.g. `mount /dev/sdb1 /mnt` for a quick look. Removable media go in `/media`.',
  },
  {
    front: 'What is `/opt` for?',
    back: 'Self-contained add-on software from third parties, each package in its own subdirectory.',
    extra: 'e.g. `/opt/google/chrome`. Software you build yourself goes in `/usr/local` instead.',
  },
  {
    front: 'What is `/proc` for?',
    back: 'A virtual filesystem with kernel and process information: one numbered directory per running process.',
    extra: 'Nothing in it is on disk: `/proc/cpuinfo` is generated when you read it.',
  },
  {
    front: 'What is `/tmp` for?',
    back: 'Temporary files for any user; may be emptied at reboot.',
    extra: 'World-writable with the sticky bit, so users can delete only their own files. Contrast `/var/tmp`.',
  },
  {
    front: 'What is `/usr` for?',
    back: 'The second hierarchy: the bulk of installed, read-only software (programs, libraries, documentation).',
    extra: 'It has its own `bin`, `sbin`, `lib`, `share` and `local`.',
  },
  {
    front: 'What is `/var` for?',
    back: 'Variable data that changes while the system runs: logs, spools, caches, databases.',
    extra: 'var = variable data, not variables.',
  },
  {
    front: 'What is `/var/log` for?',
    back: 'The log files of the system and its services.',
    extra: 'e.g. `syslog` or `messages`, `auth.log` or `secure`. The systemd journal is read with `journalctl`.',
  },
  {
    front: 'What is `/etc/passwd`?',
    back: 'One line per user account: name, password placeholder, UID, GID, comment, home directory, login shell.',
    extra: 'World-readable. An `x` in the password field means the hash is in `/etc/shadow`.',
  },
  {
    front: 'What is `/etc/shadow`?',
    back: 'The users’ password hashes and password-aging data, readable only by root.',
    extra: 'Change aging with `chage`, passwords with `passwd`.',
  },
  {
    front: 'What is `/etc/group`?',
    back: 'The groups: group name, GID and the list of members.',
  },
  {
    front: 'What is `~/.bashrc`?',
    back: 'Your personal startup file for every interactive shell: aliases, functions, prompt.',
    extra: 'Apply changes to the current shell with `source ~/.bashrc`.',
  },
  {
    front: 'What is `/etc/fstab`?',
    back: 'The filesystems to mount at boot: device, mount point, type, options, dump and fsck order.',
    extra: 'A manual `mount` is lost at reboot; an `/etc/fstab` entry is persistent.',
  },
  {
    front: 'What is `/etc/hosts`?',
    back: 'Static hostname-to-IP mappings, checked before DNS by default.',
  },
  {
    front: 'What is `/etc/hostname`?',
    back: 'The system’s hostname.',
    extra: '`hostnamectl set-hostname` writes it.',
  },
  {
    front: 'What is `/dev/null`?',
    back: 'The bit bucket: discards everything written to it; reading it gives end-of-file.',
    extra: 'e.g. `find / -name x 2> /dev/null` hides the error messages.',
  },

  // Which path holds it
  {
    front: 'Which directory is the top of the whole tree, where every absolute path starts?',
    back: '`/`',
    extra: 'Not to be confused with `/root`, the root user’s home.',
  },
  {
    front: 'Which top-level directory holds the essential commands every user needs, such as `ls` and `cp`?',
    back: '`/bin`',
    extra: 'On current distributions it’s a symlink to `/usr/bin` (the usr merge).',
  },
  {
    front: 'Which top-level directory holds the essential system administration commands, such as `fsck` and `mkfs`?',
    back: '`/sbin`',
    extra: 'Mostly for root. A symlink to `/usr/sbin` on merged systems.',
  },
  {
    front: 'Which directory holds the kernel image, the initramfs and the bootloader files?',
    back: '`/boot`',
    extra: 'Often a small separate partition.',
  },
  {
    front: 'Which directory holds the device files, such as `/dev/sda` and `/dev/null`?',
    back: '`/dev`',
    extra: 'Created dynamically by the kernel and udev as devices appear.',
  },
  {
    front: 'Which directory holds the system-wide configuration files?',
    back: '`/etc`',
    extra: 'Host-specific and static: configuration only, no programs. `/etc/passwd`, `/etc/fstab`, `/etc/hosts`…',
  },
  {
    front: 'Which directory holds the regular users’ home directories?',
    back: '`/home`',
    extra: 'Often a separate partition or network share, so users’ data survives a reinstall.',
  },
  {
    front: 'Which directory is the root user’s home?',
    back: '`/root`',
    extra: 'Kept on the root filesystem, so it’s there even when `/home` isn’t mounted.',
  },
  {
    front: 'Which top-level directory holds the essential shared libraries and the kernel modules?',
    back: '`/lib`',
    extra: '`/lib64` holds the 64-bit libraries on some distributions. A symlink to `/usr/lib` on merged systems.',
  },
  {
    front: 'Under which directory are removable media such as USB sticks mounted automatically?',
    back: '`/media`',
    extra: 'e.g. `/media/alice/USBSTICK`. Contrast `/mnt`, for manual mounts.',
  },
  {
    front: 'Which directory is meant for filesystems an administrator mounts temporarily by hand?',
    back: '`/mnt`',
    extra: 'e.g. `mount /dev/sdb1 /mnt` for a quick look. Removable media go in `/media`.',
  },
  {
    front: 'Which directory holds self-contained third-party add-on software, one subdirectory per package?',
    back: '`/opt`',
    extra: 'e.g. `/opt/google/chrome`. Software you build yourself goes in `/usr/local` instead.',
  },
  {
    front: 'Which virtual filesystem shows kernel and process information, with a numbered directory per PID?',
    back: '`/proc`',
    extra: 'Nothing in it is on disk: `/proc/cpuinfo` is generated when you read it.',
  },
  {
    front: 'Which directory is for temporary files that may be deleted at reboot?',
    back: '`/tmp`',
    extra: 'World-writable with the sticky bit, so users can delete only their own files. Contrast `/var/tmp`.',
  },
  {
    front: 'Which top-level directory holds the bulk of installed, read-only software: programs, libraries and documentation?',
    back: '`/usr`',
    extra: 'It has its own `bin`, `sbin`, `lib`, `share` and `local`.',
  },
  {
    front: 'Which top-level directory holds data that changes as the system runs, such as logs, spools and caches?',
    back: '`/var`',
    extra: 'var = variable data, not variables.',
  },
  {
    front: 'Which directory holds the system’s log files?',
    back: '`/var/log`',
    extra: 'e.g. `syslog` or `messages`, `auth.log` or `secure`. The systemd journal is read with `journalctl`.',
  },
  {
    front: 'Which file lists every user account with its UID, home directory and login shell?',
    back: '`/etc/passwd`',
    extra: 'World-readable. An `x` in the password field means the hash is in `/etc/shadow`.',
  },
  {
    front: 'Which file holds the users’ password hashes?',
    back: '`/etc/shadow`',
    extra: 'Change aging with `chage`, passwords with `passwd`.',
  },
  {
    front: 'Which file lists the groups with their GIDs and members?',
    back: '`/etc/group`',
  },
  {
    front: 'Which personal file holds your aliases and functions, read by every new interactive shell?',
    back: '`~/.bashrc`',
    extra: 'Apply changes to the current shell with `source ~/.bashrc`.',
  },
  {
    front: 'Which file lists the filesystems to mount at boot?',
    back: '`/etc/fstab`',
    extra: 'A manual `mount` is lost at reboot; an `/etc/fstab` entry is persistent.',
  },
  {
    front: 'Which file maps hostnames to IP addresses locally, without DNS?',
    back: '`/etc/hosts`',
  },
  {
    front: 'Which file holds the system’s hostname?',
    back: '`/etc/hostname`',
    extra: '`hostnamectl set-hostname` writes it.',
  },
  {
    front: 'Which device discards everything written to it?',
    back: '`/dev/null`',
    extra: 'e.g. `find / -name x 2> /dev/null` hides the error messages.',
  },
]

export const LINUX_FILESYSTEM_BASICS: PublicDeck = {
  slug: 'linux-filesystem-basics',
  title: 'Linux filesystem basics: 50 directories and files',
  shortTitle: 'Linux filesystem basics',
  category: 'devops',
  level: 'beginner',
  icon: 'code',
  description:
    'Learn the Linux directory tree: what /etc, /var, /usr, /proc and /dev are for, plus passwd, shadow, fstab and hosts. Free flashcards, no signup.',
  intro:
    'Every Linux system shares the same layout, set by the Filesystem Hierarchy Standard. This deck covers the top-level directories and the handful of files you meet on day one: where commands, configuration, logs and home directories live, and what files such as /etc/passwd and /etc/fstab hold. Each fact is asked both ways, so you learn what a path is for and which path holds a thing.',
  faq: [
    {
      q: 'Do I need to know Linux already?',
      a: 'No. This is the place to start: it explains the directory tree itself. If you can open a terminal, you can use it.',
    },
    {
      q: 'Why is each fact asked twice?',
      a: 'Recognising /var/log is easier than recalling it. Asking both ways, from path to purpose and from purpose to path, makes the layout stick for real work and for exam questions.',
    },
    {
      q: 'What comes after this deck?',
      a: 'Linux filesystem intermediate covers /usr, /var and /etc in more depth, and the advanced deck covers boot, systemd, logging and library files. The Linux command line deck drills the commands themselves.',
    },
  ],
  cards: CARDS,
}
