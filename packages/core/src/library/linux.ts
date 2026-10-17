import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const sh = (...lines: string[]) => code('bash', ...lines)

const CARDS: CardContent[] = [
  // Finding and searching
  {
    front: 'Find regular files over 100 MB under `/var`',
    back: sh('find /var -type f -size +100M'),
    extra: '`-size` units: `k`, `M`, `G`; `+` means more than, `-` less than.',
  },
  {
    front: 'Find files with the SUID bit set',
    back: sh('find / -perm -4000 -type f 2>/dev/null'),
    extra: '`-perm -MODE` matches files with all of those bits set; `-perm /MODE` matches any of them.',
  },
  {
    front: 'Run a command on each file `find` matches',
    back: sh('find . -name "*.bak" -exec rm {} \\;'),
    extra: 'End with `{} +` instead to pass many files to one command, like `xargs`.',
  },
  {
    front: 'What does `grep -E` enable?',
    back: 'Extended regular expressions: `+`, `?`, `|`, `()` and `{}` work without backslashes',
    extra: 'The old `egrep` command is equivalent. `grep -F` matches fixed strings, with no regex at all.',
  },
  {
    front: 'grep flags `-v`, `-i`, `-c` and `-l`',
    back: '`-v` prints non-matching lines, `-i` ignores case, `-c` counts matching lines, `-l` lists only the names of matching files',
  },
  {
    front: 'Show the lines of a config file that are neither comments nor blank',
    back: sh("grep -Ev '^(#|$)' /etc/ssh/sshd_config"),
  },
  {
    front: 'Find files by name instantly from a database',
    back: sh('locate sshd_config'),
    extra: 'The database is rebuilt by `updatedb`, usually daily from cron, so very new files may be missing.',
  },
  // Permissions and links
  {
    front: 'The special permission bits in octal',
    back: '4 = SUID, 2 = SGID, 1 = sticky, written before the usual three digits, as in `chmod 4755`',
  },
  {
    front: 'What does SUID do on an executable?',
    back: 'The program runs with the file owner’s privileges instead of the caller’s',
    extra:
      '`/usr/bin/passwd` is SUID root so users can update `/etc/shadow`. It shows as `s` in the owner’s execute slot: `-rwsr-xr-x`.',
  },
  {
    front: 'What does SGID do on a directory?',
    back: 'New files created inside inherit the directory’s group instead of the creator’s primary group',
    extra: 'Handy for shared team directories.',
  },
  {
    front: 'What does the sticky bit do on a directory?',
    back: 'Only a file’s owner, the directory’s owner or root can delete or rename files in it',
    extra: '`/tmp` is mode 1777, shown as `drwxrwxrwt`.',
  },
  {
    front: 'With `umask 022`, what permissions do new files and directories get?',
    back: 'Files 644 (`rw-r--r--`), directories 755 (`rwxr-xr-x`)',
    extra: 'The umask removes bits from the defaults of 666 for files and 777 for directories.',
  },
  {
    front: 'Change a file’s owner and group at once',
    back: sh('chown alice:developers report.txt'),
    extra: 'Add `-R` to recurse into directories. `chgrp` changes only the group.',
  },
  {
    front: 'Hard link vs symbolic link',
    back: 'A hard link is another name for the same inode (same filesystem only, not for directories); a symlink is a small file holding a path, which can cross filesystems and breaks if the target is removed',
    extra: sh('ln data.txt data-hard.txt', 'ln -s /etc/nginx/nginx.conf nginx.conf'),
  },
  {
    front: 'What is an inode?',
    back: 'The structure that stores a file’s metadata (type, permissions, owner, size, timestamps, data block locations), but not its name',
    extra: '`ls -i` shows inode numbers; `df -i` shows inode usage per filesystem.',
  },
  // Disks and filesystems
  {
    front: 'The six fields of an `/etc/fstab` line',
    back: 'Device (or `UUID=`/`LABEL=`), mount point, filesystem type, mount options, dump flag, fsck pass order',
    extra:
      'Example: `UUID=… /home ext4 defaults 0 2`. For the fsck pass, `1` is the root filesystem, `2` others, `0` skips the check.',
  },
  {
    front: 'Mount everything in `/etc/fstab` that isn’t mounted yet',
    back: sh('mount -a'),
    extra: 'A good test after editing fstab, before you reboot. Entries with the `noauto` option are skipped.',
  },
  {
    front: 'MBR vs GPT partition tables',
    back: 'MBR: up to 4 primary partitions (or 3 plus an extended one holding logical partitions) and disks up to 2 TiB. GPT: 128 partitions by default and far larger disks; used with UEFI',
    extra: '`fdisk` and `parted` handle both; `gdisk` is GPT-only.',
  },
  {
    front: 'Create an ext4 filesystem, then check it',
    back: sh('mkfs.ext4 /dev/sdb1', 'fsck /dev/sdb1'),
    extra: 'Only run `fsck` on unmounted filesystems. For XFS, use `xfs_repair`.',
  },
  {
    front: 'Set up and enable a swap partition',
    back: sh('mkswap /dev/sdb2', 'swapon /dev/sdb2'),
    extra: 'Check with `swapon --show` or `free -h`; add a `swap` line to `/etc/fstab` to keep it after reboot.',
  },
  // Boot, systemd and logs
  {
    front: 'SysV runlevels 0, 1, 3, 5 and 6',
    back: '0 halt · 1 single-user (maintenance) · 3 multi-user, text mode with networking · 5 multi-user, graphical · 6 reboot',
    extra: 'Runlevels 2 and 4 vary by distribution.',
  },
  {
    front: 'systemd targets that replace the runlevels',
    back: '`poweroff.target` (0), `rescue.target` (1), `multi-user.target` (3), `graphical.target` (5), `reboot.target` (6)',
  },
  {
    front: 'Show and change the default boot target',
    back: sh('systemctl get-default', 'systemctl set-default multi-user.target'),
  },
  {
    front: 'Switch to rescue mode now, without rebooting',
    back: sh('systemctl isolate rescue.target'),
    extra: 'The SysV equivalent is `telinit 1`.',
  },
  {
    front: 'Start a service now and enable it at boot',
    back: sh('systemctl enable --now nginx'),
    extra: '`systemctl status nginx` shows whether it is running and its latest log lines.',
  },
  {
    front: 'Show a service’s log messages since the last boot',
    back: sh('journalctl -u nginx -b'),
    extra: '`-f` follows new messages; `-p err` shows only errors and worse.',
  },
  {
    front: 'Regenerate the GRUB 2 configuration after editing `/etc/default/grub`',
    back: sh('grub-mkconfig -o /boot/grub/grub.cfg'),
    extra: 'Debian and Ubuntu wrap this as `update-grub`; Red Hat systems run `grub2-mkconfig -o /boot/grub2/grub.cfg`.',
  },
  {
    front: 'Load a kernel module together with its dependencies',
    back: sh('modprobe usb_storage'),
    extra:
      '`insmod` loads a single module file without resolving dependencies. `lsmod` lists loaded modules; `modprobe -r` removes one.',
  },
  {
    front: 'List the shared libraries a program needs',
    back: sh('ldd /usr/bin/ssh'),
    extra: 'After adding a library directory under `/etc/ld.so.conf.d/`, run `ldconfig` to rebuild the cache.',
  },
  // Package management
  {
    front: 'Debian: install a local `.deb`, list installed packages, list a package’s files',
    back: sh('dpkg -i package.deb', 'dpkg -l', 'dpkg -L openssh-server'),
  },
  { front: 'Which package owns a file? (Debian and RPM)', back: sh('dpkg -S /usr/bin/ssh', 'rpm -qf /usr/bin/ssh') },
  {
    front: '`apt remove` vs `apt purge`',
    back: '`remove` uninstalls the package but keeps its configuration files; `purge` deletes them too',
    extra: '`apt update` refreshes the package lists; `apt upgrade` installs newer versions.',
  },
  {
    front: 'RPM: install, upgrade and erase a package',
    back: sh('rpm -ivh package.rpm', 'rpm -Uvh package.rpm', 'rpm -e package'),
    extra: '`rpm` doesn’t resolve dependencies; `dnf` (formerly `yum`) and `zypper` (openSUSE) do.',
  },
  // Users and groups
  {
    front: 'The seven fields of `/etc/passwd`',
    back: 'username : password placeholder (`x`) : UID : GID : comment (GECOS) : home directory : login shell',
  },
  {
    front: 'Where are password hashes stored?',
    back: '`/etc/shadow`, readable only by root',
    extra: 'It also holds password ageing data, managed with `chage`.',
  },
  {
    front: 'Create a user with a home directory and Bash as the shell',
    back: sh('useradd -m -s /bin/bash alice', 'passwd alice'),
  },
  {
    front: 'Add a user to a supplementary group, keeping their other groups',
    back: sh('usermod -aG wheel alice'),
    extra: 'Without `-a`, `-G` replaces the user’s supplementary groups.',
  },
  // Scheduling and processes
  {
    front: 'The five time fields of a crontab line',
    back: 'Minute, hour, day of month, month, day of week',
    extra: sh('# 02:30 every Monday', '30 2 * * 1 /usr/local/bin/backup.sh'),
  },
  {
    front: 'How does `/etc/crontab` differ from a user’s crontab?',
    back: 'System crontabs (`/etc/crontab`, `/etc/cron.d/`) have a sixth field naming the user to run as',
    extra: 'Edit your own with `crontab -e`; list it with `crontab -l`.',
  },
  {
    front: 'Run a job once at a later time',
    back: sh('echo "/usr/local/bin/report.sh" | at 23:00'),
    extra: '`atq` lists pending jobs; `atrm` removes one.',
  },
  {
    front: 'Nice values: the range, the default, and which is the highest priority',
    back: '-20 (highest priority) to 19 (lowest); the default is 0',
    extra: 'Start with `nice -n 10 cmd`; change with `renice -n 5 -p PID`. Only root can lower a nice value.',
  },
  {
    front: 'Suspend a foreground job, resume it in the background, then bring it back',
    back: 'Ctrl+Z, then `bg`, then `fg`',
    extra: '`jobs` lists them; `%1` refers to job 1, as in `fg %1`.',
  },
  {
    front: 'Signal numbers of SIGHUP, SIGINT, SIGKILL and SIGTERM',
    back: '1, 2, 9 and 15',
    extra: 'SIGTERM is what `kill` sends by default; SIGHUP makes many daemons reload their configuration.',
  },
  // Text processing and the shell
  {
    front: 'Create and extract a gzip-compressed tar archive',
    back: sh('tar -czvf etc.tar.gz /etc', 'tar -xzvf etc.tar.gz -C /tmp'),
    extra: '`-j` for bzip2, `-J` for xz, `-t` to list the contents.',
  },
  {
    front: 'Replace text in a file in place with sed',
    back: sh("sed -i 's/old/new/g' file.txt"),
    extra: 'Use `-i.bak` to keep a backup of the original.',
  },
  {
    front: 'Which files does Bash read for a login shell?',
    back: '`/etc/profile`, then the first of `~/.bash_profile`, `~/.bash_login` and `~/.profile` that exists',
    extra: 'Interactive non-login shells read `~/.bashrc` instead.',
  },
  {
    front: 'vi: save and quit, quit without saving, delete a line, search',
    back: '`:wq` (or `ZZ`), `:q!`, `dd`, `/pattern`',
    extra: 'Press `i` to insert text and `Esc` to return to normal mode.',
  },
  // Networking
  {
    front: 'Show IP addresses and the routing table',
    back: sh('ip addr show', 'ip route show'),
    extra: 'The `ip` command replaces the older `ifconfig` and `route`.',
  },
  {
    front: 'List listening TCP and UDP ports with their processes',
    back: sh('ss -tulpn'),
    extra: '`ss` replaces `netstat`. Run it as root to see every process.',
  },
  {
    front: 'Which file sets the order of name lookups (local files, DNS)?',
    back: '`/etc/nsswitch.conf`, e.g. `hosts: files dns`',
    extra: 'Static names live in `/etc/hosts`; DNS servers are listed in `/etc/resolv.conf`.',
  },
]

export const LINUX: PublicDeck = {
  slug: 'linux-command-line',
  title: 'Linux command line: 50 LPIC-1 essentials',
  shortTitle: 'Linux command line',
  category: 'devops',
  level: 'intermediate',
  icon: 'code',
  description:
    'Linux commands and files for sysadmins and LPIC-1 candidates: find and grep, permissions and special bits, fstab, systemd targets, package managers, users, cron and more.',
  intro:
    'This deck follows the LPIC-1 exam topics (101 and 102): filesystems and partitions, permissions including SUID, SGID and the sticky bit, boot targets, Debian and RPM package tools, users and groups, scheduling and process control. Answers are real commands you can run, with notes on the flags that trip people up.',
  faq: [
    {
      q: 'Is this deck enough to pass LPIC-1?',
      a: 'No single deck is. It drills the commands, files and numbers the exams expect you to recall instantly; pair it with hands-on practice in a virtual machine.',
    },
    {
      q: 'Does it cover both Debian and Red Hat systems?',
      a: 'Yes. Package management covers dpkg and apt as well as rpm, dnf and zypper, and the systemd commands are the same on every major distribution.',
    },
    {
      q: 'How is this different from the Git & terminal deck?',
      a: 'That deck covers everyday shell basics such as pipes, redirects and chmod 755. This one goes deeper into system administration.',
    },
  ],
  cards: CARDS,
}
