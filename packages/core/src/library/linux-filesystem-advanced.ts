import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const CARDS: CardContent[] = [
  // What each path is for
  {
    front: 'What is `/lost+found` for?',
    back: 'Where `fsck` puts recovered files that lost their directory entry after a crash.',
    extra: 'One at the top of each ext2/3/4 filesystem; normally empty.',
  },
  {
    front: 'What is `/usr/share/man` for?',
    back: 'The manual pages, one subdirectory per section (`man1`, `man5`, `man8`…).',
  },
  {
    front: 'What is `/var/spool` for?',
    back: 'Queues of work waiting to be processed: print jobs, outgoing mail, users’ crontabs.',
    extra: 'e.g. `/var/spool/cron` (edit crontabs with `crontab -e`, never directly) and `/var/spool/cups`.',
  },
  {
    front: 'What is `/etc/profile.d` for?',
    back: 'Extra `*.sh` scripts that `/etc/profile` runs at every login.',
    extra: 'The tidy place for your own system-wide environment settings.',
  },
  {
    front: 'What is `/etc/sudoers.d` for?',
    back: 'Extra sudo rule files, included by `/etc/sudoers`.',
    extra: 'Edit them with `visudo -f /etc/sudoers.d/NAME`.',
  },
  {
    front: 'What is `/etc/systemd/system` for?',
    back: 'The administrator’s own and overriding systemd unit files.',
    extra: 'They take precedence over the packaged units in `/usr/lib/systemd/system` (`/lib/systemd/system` on older Debian).',
  },
  {
    front: 'What is `/etc/cron.daily` for?',
    back: 'Scripts that run once a day (siblings: `cron.hourly`, `cron.weekly`, `cron.monthly`).',
    extra: 'Started by cron through `run-parts`, or by anacron on machines that aren’t always on.',
  },
  {
    front: 'What is `/etc/yum.repos.d` for?',
    back: 'The `.repo` files that define the package repositories for yum/dnf.',
    extra: 'The Debian counterpart is `/etc/apt/sources.list` plus `/etc/apt/sources.list.d/`.',
  },
  {
    front: 'What is `/lib/modules` for?',
    back: 'The kernel modules, in one subdirectory per kernel version.',
    extra: 'The running kernel’s modules are in `/lib/modules/$(uname -r)/`.',
  },
  {
    front: 'What is `/etc/login.defs`?',
    back: 'Defaults for new accounts: UID and GID ranges, password aging, home directory creation.',
  },
  {
    front: 'What is `/etc/shells`?',
    back: 'The list of valid login shells.',
    extra: '`chsh` accepts only a shell listed here.',
  },
  {
    front: 'What is `/proc/mounts`?',
    back: 'The filesystems mounted right now, as the kernel sees them.',
    extra: '`/etc/mtab` is usually a symlink to the same list.',
  },
  {
    front: 'What is `/boot/grub/grub.cfg`?',
    back: 'GRUB 2’s generated boot menu configuration; don’t edit it by hand.',
    extra:
      'RHEL: `/boot/grub2/grub.cfg`. Regenerate it with `grub-mkconfig -o` (`grub2-mkconfig` on RHEL, `update-grub` on Debian).',
  },
  {
    front: 'What is `/etc/default/grub`?',
    back: 'The GRUB 2 settings you edit (timeout, default entry, kernel parameters) before regenerating `grub.cfg`.',
  },
  {
    front: 'What is `/etc/nsswitch.conf`?',
    back: 'The order of sources for lookups, e.g. `hosts: files dns`.',
  },
  {
    front: 'What is `/etc/services`?',
    back: 'Maps service names to port numbers and protocols, e.g. `ssh 22/tcp`.',
  },
  {
    front: 'What is `/etc/ssh/ssh_config`?',
    back: 'The system-wide configuration of the SSH client, `ssh`.',
    extra: 'Per-user client settings go in `~/.ssh/config`.',
  },
  {
    front: 'What is `/etc/ld.so.conf`?',
    back: 'Extra directories the dynamic linker searches for shared libraries.',
    extra: 'Plus `/etc/ld.so.conf.d/`. Run `ldconfig` after a change to rebuild `/etc/ld.so.cache`.',
  },
  {
    front: 'What is `/etc/localtime`?',
    back: 'The system time zone: a symlink to a file in `/usr/share/zoneinfo`.',
    extra: '`timedatectl set-timezone` changes it.',
  },
  {
    front: 'What is `/proc/cmdline`?',
    back: 'The parameters the running kernel was booted with.',
  },
  {
    front: 'What is `/var/log/syslog`?',
    back: 'The general system log on Debian/Ubuntu.',
    extra: 'Red Hat-family systems use `/var/log/messages`.',
  },
  {
    front: 'What is `/var/log/messages`?',
    back: 'The general system log on Red Hat-family systems.',
    extra: 'Debian/Ubuntu use `/var/log/syslog`.',
  },
  {
    front: 'What is `/var/log/auth.log`?',
    back: 'Authentication events on Debian/Ubuntu: logins, `sudo`, SSH.',
    extra: 'Red Hat-family systems use `/var/log/secure`.',
  },
  {
    front: 'What is `/var/log/secure`?',
    back: 'Authentication events on Red Hat-family systems: logins, `sudo`, SSH.',
    extra: 'Debian/Ubuntu use `/var/log/auth.log`.',
  },
  {
    front: 'What is `/dev/zero`?',
    back: 'A device that supplies an endless stream of zero bytes when read.',
    extra: 'e.g. `dd if=/dev/zero of=swapfile bs=1M count=1024`.',
  },

  // Which path holds it
  {
    front: 'Where does `fsck` put recovered files that lost their directory entry?',
    back: '`/lost+found`',
    extra: 'One at the top of each ext2/3/4 filesystem; normally empty.',
  },
  {
    front: 'Where are the man pages stored?',
    back: '`/usr/share/man`',
  },
  {
    front: 'Which directory holds queues of pending work, such as print jobs, outgoing mail and users’ crontabs?',
    back: '`/var/spool`',
    extra: 'e.g. `/var/spool/cron` (edit crontabs with `crontab -e`, never directly) and `/var/spool/cups`.',
  },
  {
    front: 'Which directory holds `*.sh` snippets that `/etc/profile` runs at every login?',
    back: '`/etc/profile.d`',
    extra: 'The tidy place for your own system-wide environment settings.',
  },
  {
    front: 'Which directory holds extra sudo rule files that `/etc/sudoers` includes?',
    back: '`/etc/sudoers.d`',
    extra: 'Edit them with `visudo -f /etc/sudoers.d/NAME`.',
  },
  {
    front: 'Where does an administrator put custom or overriding systemd unit files?',
    back: '`/etc/systemd/system`',
    extra: 'They take precedence over the packaged units in `/usr/lib/systemd/system` (`/lib/systemd/system` on older Debian).',
  },
  {
    front: 'Which directory holds the scripts that run once a day?',
    back: '`/etc/cron.daily`',
    extra: 'Started by cron through `run-parts`, or by anacron on machines that aren’t always on.',
  },
  {
    front: 'On a Red Hat-family system, which directory holds the `.repo` files that define the package repositories?',
    back: '`/etc/yum.repos.d`',
    extra: 'The Debian counterpart is `/etc/apt/sources.list` plus `/etc/apt/sources.list.d/`.',
  },
  {
    front: 'Where are the kernel modules stored?',
    back: '`/lib/modules`',
    extra: 'The running kernel’s modules are in `/lib/modules/$(uname -r)/`.',
  },
  {
    front: 'Which file sets defaults such as UID ranges and password aging for newly created users?',
    back: '`/etc/login.defs`',
  },
  {
    front: 'Which file lists the valid login shells?',
    back: '`/etc/shells`',
    extra: '`chsh` accepts only a shell listed here.',
  },
  {
    front: 'Which file shows the kernel’s list of currently mounted filesystems?',
    back: '`/proc/mounts`',
    extra: '`/etc/mtab` is usually a symlink to the same list.',
  },
  {
    front: 'Which file is GRUB 2’s generated boot menu configuration?',
    back: '`/boot/grub/grub.cfg`',
    extra:
      'RHEL: `/boot/grub2/grub.cfg`. Regenerate it with `grub-mkconfig -o` (`grub2-mkconfig` on RHEL, `update-grub` on Debian).',
  },
  {
    front: 'Which file do you edit to change GRUB 2’s timeout or the kernel parameters?',
    back: '`/etc/default/grub`',
  },
  {
    front: 'Which file decides whether `/etc/hosts` or DNS is consulted first?',
    back: '`/etc/nsswitch.conf`',
  },
  {
    front: 'Which file maps well-known service names to port numbers?',
    back: '`/etc/services`',
  },
  {
    front: 'Which file configures the SSH client for all users?',
    back: '`/etc/ssh/ssh_config`',
    extra: 'Per-user client settings go in `~/.ssh/config`.',
  },
  {
    front: 'Which file lists extra directories to search for shared libraries?',
    back: '`/etc/ld.so.conf`',
    extra: 'Plus `/etc/ld.so.conf.d/`. Run `ldconfig` after a change to rebuild `/etc/ld.so.cache`.',
  },
  {
    front: 'Which file sets the system’s time zone?',
    back: '`/etc/localtime`',
    extra: '`timedatectl set-timezone` changes it.',
  },
  {
    front: 'Which file shows the parameters the running kernel was booted with?',
    back: '`/proc/cmdline`',
  },
  {
    front: 'On Debian/Ubuntu, which file is the main general-purpose system log?',
    back: '`/var/log/syslog`',
    extra: 'Red Hat-family systems use `/var/log/messages`.',
  },
  {
    front: 'On a Red Hat-family system, which file is the main general-purpose system log?',
    back: '`/var/log/messages`',
    extra: 'Debian/Ubuntu use `/var/log/syslog`.',
  },
  {
    front: 'On Debian/Ubuntu, which log records logins, `sudo` use and SSH authentication?',
    back: '`/var/log/auth.log`',
    extra: 'Red Hat-family systems use `/var/log/secure`.',
  },
  {
    front: 'On a Red Hat-family system, which log records logins, `sudo` use and SSH authentication?',
    back: '`/var/log/secure`',
    extra: 'Debian/Ubuntu use `/var/log/auth.log`.',
  },
  {
    front: 'Which device supplies an endless stream of zero bytes, e.g. for `dd`?',
    back: '`/dev/zero`',
    extra: 'e.g. `dd if=/dev/zero of=swapfile bs=1M count=1024`.',
  },
]

export const LINUX_FILESYSTEM_ADVANCED: PublicDeck = {
  slug: 'linux-filesystem-advanced',
  title: 'Advanced Linux filesystem: 50 config files and logs',
  shortTitle: 'Advanced Linux filesystem',
  category: 'devops',
  level: 'advanced',
  icon: 'code',
  description:
    'Deeper Linux files for LPIC-1: profile.d, sudoers.d, systemd units, GRUB config, nsswitch.conf, ld.so.conf, distro logs and /lib/modules. Free flashcards.',
  intro:
    'The last part of the Linux layout is where the exam questions get specific: drop-in directories such as /etc/profile.d and /etc/sudoers.d, systemd unit overrides, the two GRUB files, name service and library lookup, and the log files that differ between Debian and Red Hat systems. Each fact is asked both ways.',
  faq: [
    {
      q: 'Why learn distribution-specific log files?',
      a: 'Because you will meet both. Debian and Ubuntu log to /var/log/syslog and /var/log/auth.log, Red Hat-family systems to /var/log/messages and /var/log/secure, and exams ask about both.',
    },
    {
      q: 'What is a drop-in directory?',
      a: 'A .d directory, such as /etc/sudoers.d or /etc/profile.d, whose files are read alongside the main file. Packages and admins add their own files there instead of editing the main one, so updates don’t overwrite changes.',
    },
    {
      q: 'Is this enough for the LPIC-1 filesystem topics?',
      a: 'Together with the basics and intermediate decks it covers the paths the exam expects you to know. Pair it with the Linux command line deck and hands-on practice in a virtual machine.',
    },
  ],
  cards: CARDS,
}
