# -*- coding: utf-8 -*-
"""Generate exam-focused science quiz games by wrapping each question bank in the
proven Exponent-Quest engine (12s speed scoring, streaks, bonus questions, levels,
progress bridge, exit button). Only the GAME object, title, and theme palette change —
the entire engine is reused verbatim, so behavior matches existing labs exactly."""
import json, re, os
from science_banks import GAMES

HEAD = open('/tmp/head.txt').read()          # up to `const GAME =`
TAIL = open('/tmp/engine_tail.txt').read()   # `// ── state` … </html>

# Theme palettes: (grad_from, grad_to, accent_dark, accent_bright, q_shadow_ok?)
# accent_dark ~ text/headings; accent_bright ~ borders/shadows. We recolor the
# yellow theme (#a16207 dark, #facc15 bright, gradient fef9c3→fde047) into each.
PALETTES = {
    "bio":   ("#dcfce7", "#86efac", "#15803d", "#4ade80"),   # green
    "chem":  ("#e0e7ff", "#a5b4fc", "#4338ca", "#818cf8"),   # indigo
    "phys":  ("#dbeafe", "#93c5fd", "#1d4ed8", "#60a5fa"),   # blue
    "earth": ("#fef3c7", "#fcd34d", "#b45309", "#fbbf24"),   # amber/earth
    "space": ("#ede9fe", "#c4b5fd", "#6d28d9", "#a78bfa"),   # violet
}

TITLE_ANCHOR   = '<title>Exponent Quest ⚡</title>'
GRAD_ANCHOR    = 'background:linear-gradient(160deg,#fef9c3 0%,#fde047 100%)'
TBAR_ANCHOR    = 'class="title">⚡ Exponent Quest'

def esc(s):  # for JS string literals
    return s.replace('\\', '\\\\').replace('"', '\\"')

def game_object(g):
    """Emit the const GAME = {...} with an inline level->questions bank."""
    banks = []
    for lvl in g["levels"]:
        qs = []
        for it in lvl:
            parts = [
                'q:"%s"' % esc(it["q"]),
                'choices:[%s]' % ",".join('"%s"' % esc(c) for c in it["choices"]),
                'answer:0',
            ]
            if it.get("sub"): parts.append('sub:"%s"' % esc(it["sub"]))
            if it.get("why"): parts.append('why:"%s"' % esc(it["why"]))
            qs.append("{" + ",".join(parts) + "}")
        banks.append("[" + ",".join(qs) + "]")
    banks_js = "[" + ",".join(banks) + "]"
    return (
        'const BANKS = %s;\n'
        'const GAME = { id:"%s", mode:"choice", maxLevel:3, gen:function(level){\n'
        '  const pool = BANKS[Math.min(level,3)-1].slice();\n'
        '  // shuffle then take up to 12 so rounds vary\n'
        '  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}\n'
        '  const out=[]; for(let k=0;k<12;k++){ out.push(pool[k %% pool.length]); } return out;\n'
        '} };\n'
    ) % (banks_js, g["id"])

def build(g):
    grad_from, grad_to, dark, bright = PALETTES[g["palette"]]
    html = HEAD
    # 1) recolor the yellow theme -> palette (order matters: longer strings first)
    html = html.replace(GRAD_ANCHOR,
        'background:linear-gradient(160deg,%s 0%%,%s 100%%)' % (grad_from, grad_to))
    html = html.replace('#a16207', dark).replace('#facc15', bright)
    # secondary yellows used sparsely
    html = html.replace('#fde047', grad_to).replace('#fef9c3', grad_from)
    html = html.replace('#fefce8', grad_from).replace('#fff7ed', grad_from)
    # 2) titles
    html = html.replace(TITLE_ANCHOR, '<title>%s %s</title>' % (g["title"], g["emoji"]))
    html = html.replace(TBAR_ANCHOR, 'class="title">%s %s' % (g["emoji"], g["title"]))
    # 3) engine: GAME object + tail
    return html + game_object(g) + "\n" + TAIL

OUT = "public/labs"
built = []
for g in GAMES:
    html = build(g)
    path = os.path.join(OUT, g["id"] + ".html")
    open(path, "w").write(html)
    built.append((g["id"], len(html)))

for i, (gid, n) in enumerate(built, 1):
    print("%2d. %-34s %6d bytes" % (i, gid, n))
print("Built", len(built), "games")
