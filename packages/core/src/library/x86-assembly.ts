import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

// Intel syntax as NASM writes it, unless a card says it shows AT&T syntax.

const asm = (...lines: string[]) => code('x86asm', ...lines)

const CARDS: CardContent[] = [
  // Registers
  {
    front: 'The 16 general-purpose registers of x86-64',
    back: '`rax`, `rbx`, `rcx`, `rdx`, `rsi`, `rdi`, `rbp`, `rsp` and `r8` to `r15`',
  },
  {
    front: 'The smaller registers inside `rax`',
    back: '`eax` (low 32 bits), `ax` (low 16 bits), `al` (low 8 bits) and `ah` (bits 8 to 15)',
  },
  {
    front: 'The smaller registers inside `r8`',
    back: '`r8d` (low 32 bits), `r8w` (low 16 bits) and `r8b` (low 8 bits)',
  },
  {
    front: 'The 8-bit registers of `rsi`, `rdi`, `rbp` and `rsp`',
    back: '`sil`, `dil`, `bpl` and `spl`',
    extra: 'They need a REX prefix, so an instruction that uses one of them can’t also use `ah`, `bh`, `ch` or `dh`.',
  },
  {
    front: 'What happens to the upper half of `rax` after `mov eax, 1`?',
    back: 'It is zeroed: writing a 32-bit register zero-extends the result into the full 64-bit register',
    extra: 'Writing `ax` or `al` leaves the other bits unchanged.',
  },
  {
    front: 'What do `rip` and `rflags` hold?',
    back: '`rip` holds the address of the next instruction to run; `rflags` holds the status flags (ZF, SF, CF, OF and others) and control bits such as the direction flag',
  },
  {
    front: 'Why do compilers zero a register with `xor eax, eax`?',
    back: 'It clears all of `rax` in 2 bytes instead of the 5 of `mov eax, 0`, and CPUs recognize it as a zeroing idiom',
    extra: 'Unlike `mov`, it also changes the flags.',
  },
  {
    front: 'Sizes of a byte, word, dword and qword',
    back: '1, 2, 4 and 8 bytes',
    extra: 'A word is 16 bits for historical reasons: it was the 8086’s register size.',
  },
  // Flags and jumps
  {
    front: 'The four main status flags',
    back: 'ZF: the result was zero. SF: the result’s sign bit is set. CF: an unsigned carry or borrow. OF: a signed overflow',
  },
  {
    front: 'What does `cmp rax, rbx` do?',
    back: 'Computes `rax - rbx`, sets the flags as `sub` would, and throws the result away',
  },
  {
    front: 'What does `test rax, rax` do?',
    back: 'ANDs `rax` with itself to set the flags without storing anything: ZF is set when `rax` is zero, and SF when it is negative',
    extra: 'Usually followed by `jz` or `jnz`. `test al, 1` checks the lowest bit.',
  },
  {
    front: 'Signed vs unsigned conditional jumps',
    back: 'Signed comparisons use `jl`, `jle`, `jg`, `jge` (less, greater); unsigned ones use `jb`, `jbe`, `ja`, `jae` (below, above)',
    extra: 'Signed jumps read SF, OF and ZF; unsigned jumps read CF and ZF.',
  },
  {
    front: '`je` vs `jz`',
    back: 'Two names for the same instruction: jump if ZF is set',
    extra: 'Likewise `jne` and `jnz` both jump if ZF is clear.',
  },
  {
    front: 'Jump to `.small` if `rdi` is less than 10, as a signed number',
    back: asm('cmp rdi, 10', 'jl .small'),
    extra: 'For unsigned values, use `jb` instead.',
  },
  {
    front: 'A loop that runs its body 10 times',
    back: asm('    mov ecx, 10', '.next:', '    ; loop body', '    dec ecx', '    jnz .next'),
    extra: '`dec` sets ZF when the counter reaches zero, so no `cmp` is needed.',
  },
  {
    front: 'Set `rax` to the larger of `rdi` and `rsi` (signed) without a branch',
    back: asm('mov rax, rdi', 'cmp rdi, rsi', 'cmovl rax, rsi   ; if rdi < rsi, rax = rsi'),
  },
  {
    front: 'Turn a comparison into 0 or 1',
    back: asm('cmp rdi, rsi', 'sete al', 'movzx eax, al   ; rax = 1 if rdi == rsi, else 0'),
    extra: '`setcc` writes only one byte, so zero-extend it before using the full register.',
  },
  // Moving data and addressing
  {
    front: '`mov rax, [rbx+8]` vs `lea rax, [rbx+8]`',
    back: '`mov` loads the 8 bytes stored at address `rbx+8`; `lea` puts the address `rbx+8` itself in `rax` without touching memory',
  },
  {
    front: 'Multiply `rdi` by 5 with a single `lea`',
    back: asm('lea rax, [rdi+rdi*4]'),
    extra: '`lea` can do this kind of arithmetic in one instruction, and it doesn’t change the flags.',
  },
  {
    front: 'The general form of a memory operand',
    back: '`[base + index*scale + displacement]`, where scale is 1, 2, 4 or 8 and the displacement is a signed 32-bit constant',
    extra: '`rsp` can be a base but never an index.',
  },
  {
    front: 'Can `mov` copy directly from memory to memory?',
    back: 'No. At most one operand can be in memory, so load the value into a register first',
    extra: 'String instructions such as `movsb` are the exception.',
  },
  {
    front: 'Why does `mov [rax], 1` fail to assemble?',
    back: 'Nothing says how many bytes to write; add a size: `mov qword [rax], 1`',
    extra: 'GNU as in Intel mode and MASM write it `qword ptr [rax]`.',
  },
  {
    front: '`movzx` vs `movsx`',
    back: 'Both load a smaller value into a larger register: `movzx` fills the upper bits with zeros, `movsx` with copies of the sign bit',
    extra: asm(
      'movzx eax, byte [rdi]   ; unsigned char',
      'movsx rax, word [rdi]   ; signed short',
      'movsxd rax, dword [rdi] ; signed int',
    ),
  },
  {
    front: 'Load the address of `msg` with RIP-relative addressing',
    back: asm('lea rax, [rel msg]'),
    extra: 'GNU as writes `lea rax, [rip + msg]`. Addresses relative to `rip` keep code position-independent.',
  },
  {
    front: 'How big can an immediate operand be?',
    back: 'Usually 32 bits, sign-extended to 64; only `mov` into a 64-bit register accepts a full 64-bit immediate',
    extra: 'GNU as calls that form `movabs`.',
  },
  {
    front: 'Which byte does `mov dword [rdi], 0x12345678` store at the lowest address?',
    back: '`0x78`: x86 is little-endian, so the bytes in memory are `78 56 34 12`',
  },
  // Arithmetic
  {
    front: '`inc rax` vs `add rax, 1`',
    back: 'Both add one, but `inc` leaves CF unchanged while `add` updates it',
  },
  {
    front: 'Unsigned 64-bit division with `div rcx`',
    back: 'Divides the 128-bit value in `rdx:rax` by `rcx`: the quotient goes to `rax` and the remainder to `rdx`. Zero `rdx` first',
    extra: 'For signed `idiv`, sign-extend `rax` into `rdx` with `cqo`. Dividing by zero raises an exception (SIGFPE on Linux).',
  },
  {
    front: '`shr` vs `sar`',
    back: '`shr` shifts in zeros, dividing an unsigned value by a power of two; `sar` copies the sign bit, dividing a signed value',
    extra: '`sar` rounds toward negative infinity: shifting -7 right by one gives -4, while `idiv` by 2 gives -3.',
  },
  // The stack and functions
  {
    front: 'What do `push rax` and `pop rax` do?',
    back: '`push` subtracts 8 from `rsp`, then stores `rax` at `[rsp]`; `pop` loads `[rsp]` into `rax`, then adds 8 to `rsp`',
    extra: 'The stack grows toward lower addresses.',
  },
  {
    front: 'What does `call func` do?',
    back: 'Pushes the return address (the address of the next instruction) and jumps to `func`',
  },
  {
    front: 'What does `ret` do?',
    back: 'Pops the return address off the stack and jumps to it',
  },
  {
    front: 'A function prologue and epilogue with a frame pointer',
    back: asm(
      'func:',
      '    push rbp',
      '    mov rbp, rsp',
      '    sub rsp, 16      ; room for locals',
      '    ; ...',
      '    leave            ; mov rsp, rbp, then pop rbp',
      '    ret',
    ),
  },
  {
    front: 'After `push rbp` and `mov rbp, rsp`, what are `[rbp]`, `[rbp+8]` and `[rbp-8]`?',
    back: 'The caller’s saved `rbp`, the return address, and the first 8-byte slot for local variables',
    extra: 'With System V, arguments passed on the stack start at `[rbp+16]`.',
  },
  // System V AMD64 calling convention
  {
    front: 'Which registers carry the first six integer or pointer arguments (System V AMD64)?',
    back: '`rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`, in that order; any further arguments go on the stack',
    extra: 'Windows x64 differs: it uses `rcx`, `rdx`, `r8`, `r9` and reserves 32 bytes of shadow space.',
  },
  {
    front: 'Where does a function return an integer or pointer (System V AMD64)?',
    back: 'In `rax`; a 128-bit value uses `rdx:rax`',
  },
  {
    front: 'Floating-point arguments and return values (System V AMD64)',
    back: 'Arguments go in `xmm0` to `xmm7`; a `double` or `float` comes back in `xmm0`',
  },
  {
    front: 'Callee-saved registers in System V AMD64',
    back: '`rbx`, `rbp` and `r12` to `r15` (and `rsp`): a function that uses them must restore them before returning',
  },
  {
    front: 'Caller-saved registers in System V AMD64',
    back: '`rax`, `rcx`, `rdx`, `rsi`, `rdi`, `r8` to `r11` and all `xmm` registers: any call may change them, so save them yourself if you need them afterwards',
  },
  {
    front: 'Stack alignment rule for a `call` (System V AMD64)',
    back: '`rsp` must be a multiple of 16 just before the `call`, so on entry to a function `rsp` is 8 bytes past a 16-byte boundary',
    extra: 'That’s why `rsp` is 16-byte aligned again once a function has pushed `rbp`.',
  },
  {
    front: 'What is the red zone?',
    back: 'The 128 bytes below `rsp` that a function may use without moving `rsp`; signal handlers won’t overwrite them',
    extra: 'Handy for leaf functions. Kernel code is compiled without it.',
  },
  {
    front: 'What goes in `al` before calling a variadic function such as `printf`?',
    back: 'An upper bound on the number of vector registers used to pass arguments, so `xor eax, eax` when there are no floating-point arguments',
  },
  {
    front: 'Implement `int sum(int a, int b)`',
    back: asm('sum:', '    lea eax, [rdi+rsi]', '    ret'),
    extra: '`a` arrives in `edi`, `b` in `esi`, and the result is returned in `eax`.',
  },
  // Linux syscalls and tooling
  {
    front: 'How do you make a Linux system call in x86-64?',
    back: 'Put the syscall number in `rax` and arguments in `rdi`, `rsi`, `rdx`, `r10`, `r8`, `r9`, then run `syscall`; the result comes back in `rax`, with a negative errno on failure',
  },
  {
    front: 'Why does the fourth syscall argument go in `r10` rather than `rcx`?',
    back: '`syscall` overwrites `rcx` with the return address (and `r11` with `rflags`)',
  },
  {
    front: 'Print `hi` and exit with status 0 on Linux',
    back: asm(
      'section .data',
      'msg: db "hi", 10',
      'len equ $ - msg',
      '',
      'section .text',
      'global _start',
      '_start:',
      '    mov eax, 1          ; write',
      '    mov edi, 1          ; stdout',
      '    lea rsi, [rel msg]',
      '    mov edx, len',
      '    syscall',
      '    mov eax, 60         ; exit',
      '    xor edi, edi        ; status 0',
      '    syscall',
    ),
  },
  {
    front: 'What goes in the `.text`, `.data`, `.rodata` and `.bss` sections?',
    back: 'Code; initialized writable data; read-only data such as string constants; zero-initialized data, which takes no space in the file',
  },
  {
    front: 'Assemble and link a NASM program on Linux',
    back: code('bash', 'nasm -f elf64 hello.asm -o hello.o', 'ld hello.o -o hello'),
    extra: 'To call C library functions, define `main` instead of `_start` and link with `gcc`.',
  },
  // AT&T syntax
  {
    front: 'How does AT&T syntax differ from Intel syntax?',
    back: 'AT&T puts the source first and the destination last, prefixes registers with `%` and immediates with `$`, and adds size suffixes: AT&T `movq $1, %rax` is Intel `mov rax, 1`',
    extra: 'GNU as and objdump use AT&T by default; `objdump -d -M intel` shows Intel syntax.',
  },
  {
    front: 'What is the AT&T operand `8(%rbp,%rcx,4)` in Intel syntax?',
    back: '`[rbp+rcx*4+8]`: AT&T writes displacement(base, index, scale)',
  },
]

export const X86_ASSEMBLY: PublicDeck = {
  slug: 'x86-64-assembly',
  title: 'x86-64 assembly: 50 cards on registers, instructions and calling conventions',
  shortTitle: 'x86-64 assembly',
  category: 'programming',
  level: 'intermediate',
  icon: 'code',
  description:
    'x86-64 assembly in Intel syntax: registers and sub-registers, flags, mov and lea, jumps, the stack frame, the System V calling convention and Linux syscalls.',
  intro:
    'Fifty cards for reading compiler output and writing small routines by hand: the general-purpose registers and their 32-, 16- and 8-bit parts, flags and conditional jumps, addressing modes, mov versus lea, the stack and function frames, the System V AMD64 calling convention used on Linux and macOS, and raw Linux system calls. Examples use Intel syntax as NASM writes it, and two cards cover reading AT&T syntax.',
  faq: [
    {
      q: 'Intel or AT&T syntax?',
      a: 'Intel syntax, as NASM writes it. GNU as and objdump default to AT&T syntax, so two cards show how to translate it.',
    },
    {
      q: 'Does it cover Windows?',
      a: 'The calling convention cards follow System V AMD64, used by Linux, macOS and the BSDs, and the system call cards are Linux-only. One card notes how the Windows x64 convention differs.',
    },
    {
      q: 'Do I need to know C?',
      a: 'It helps. Several cards relate assembly to C functions and types, but the registers and instructions stand on their own.',
    },
  ],
  cards: CARDS,
}
