import os, re

creator_dir = r'c:\Users\snigd\OneDrive\Documents\trendify\frontend\creator'

# OLD: popup head inner div - just name2 + email2
OLD_POPUP_INNER = '''<div><div style="font-size:12px;font-weight:700;color:#f2f0ff" id="sbName2"></div><div style="font-family:'DM Mono',monospace;font-size:10px;color:#9d99bb" id="sbEmail2"></div></div>'''

# NEW: popup head inner div - name2 + email2 + phone + address
NEW_POPUP_INNER = '''<div><div style="font-size:12px;font-weight:700;color:#f2f0ff" id="sbName2"></div><div style="font-family:'DM Mono',monospace;font-size:10px;color:#9d99bb" id="sbEmail2"></div><div class="c-sb-phone" style="font-family:'DM Mono',monospace;font-size:10px;color:#9d99bb"></div><div class="c-sb-address" style="font-family:'DM Mono',monospace;font-size:10px;color:#9d99bb"></div></div>'''

# OLD: sidebar user inner div - just name + email (no phone/address spans)
OLD_SIDEBAR_INNER = '''<div style="display:flex;flex-direction:column;">
          <span class="c-sidebar-label" id="sbName" style="font-size:12px;font-weight:600;"></span>
          <span class="c-sb-email" id="sbEmail" style="font-size:11px;"></span>
        </div>'''

NEW_SIDEBAR_INNER = '''<div style="display:flex;flex-direction:column;">
          <span class="c-sidebar-label" id="sbName" style="font-size:12px;font-weight:600;"></span>
          <span class="c-sb-email" id="sbEmail" style="font-size:11px;"></span>
          <span class="c-sb-phone" style="font-size:10px;color:#9d99bb;"></span>
          <span class="c-sb-address" style="font-size:10px;color:#9d99bb;"></span>
        </div>'''

for fname in os.listdir(creator_dir):
    if not fname.endswith('.html'):
        continue
    fpath = os.path.join(creator_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False

    # Fix popup head HTML
    if OLD_POPUP_INNER in content:
        content = content.replace(OLD_POPUP_INNER, NEW_POPUP_INNER)
        changed = True

    # Fix sidebar user HTML
    if OLD_SIDEBAR_INNER in content:
        content = content.replace(OLD_SIDEBAR_INNER, NEW_SIDEBAR_INNER)
        changed = True

    if changed:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {fname}')
    else:
        print(f'No change: {fname}')
