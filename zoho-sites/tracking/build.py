# Builds homepage-sites-v5.zoho-footer.PATCHED.html from the current live footer.
import re,shutil,sys
SRC='/workspace/zoho-paste/homepage-sites-v5.zoho-footer.html'; TARGET=44800
shutil.copy(SRC,'footer.BASE-2026-11-09.html')
B=open(SRC).read(); F=B; js=open('dl-track.js').read().strip()
old='"https://bookings.delphi-me.com/portal-embed#/4937208000000036014"'
assert F.count(old)==1; F=F.replace(old,old+'+(self.dlBP||"")')
i=F.rfind('<script>'); assert i>0 and F.endswith('</script>'); F=F[:i+8]+js+F[i+8:]  # prepend to last script so ?contact=thanks is read before the existing code strips it
cur=[len(F)]; n=[0]
def fixtag(t):
    def r(m):
        if cur[0]<=TARGET: return m.group(0)
        cur[0]-=2; n[0]+=1; return m.group(1)+'='+m.group(2)
    return re.sub(r'''(\s[\w:-]+)="([A-Za-z0-9_\-.#:]+)"(?=[\s>])''',r,t)
parts=re.split(r'(<script\b.*?</script>|<style\b.*?</style>)',F,flags=re.S)
N=''.join(p if p.startswith(('<script','<style')) else re.sub(r'<[a-zA-Z][^>]*>',lambda m:fixtag(m.group(0)),p) for p in parts)
open('homepage-sites-v5.zoho-footer.PATCHED.html','w').write(N)
print('base',len(B),'patched',len(N),'attrs unquoted',n[0])
