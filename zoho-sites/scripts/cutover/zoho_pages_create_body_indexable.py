page.locator('#addPage_name').fill(name); page.keyboard.press('End'); page.wait_for_timeout(500)
page.locator('#pg_page_url').fill(slug); page.locator('#pg_page_url').press('End'); page.wait_for_timeout(500)
state=page.evaluate("""()=>{const out={};function row(txt){const l=[...document.querySelectorAll('label,span,div')].find(e=>e.offsetParent&&(e.innerText||'').trim()===txt&&e.children.length===0);if(!l)return null;let r=l;for(let i=0;i<4&&r;i++){const cb=r.querySelector('input[type=checkbox]');if(cb)return cb;r=r.parentElement;}return null}
const menu=row('Add page to default menu'); out.menu_before=menu?menu.checked:'nf'; if(menu&&menu.checked){(menu.nextElementSibling||menu).click(); if(menu.checked) menu.click();} out.menu_after=menu?menu.checked:'nf';
const home=row('Set as home page'); out.home=home?home.checked:'nf';
const ni=row('Instruct crawlers not to index this page (noindex)'); out.noindex_before=ni?ni.checked:'nf'; if(ni&&ni.checked){ni.click();} out.noindex_after=ni?ni.checked:'nf';
return out}""")
print("STATE",state); res["notes"].append(state)
page.screenshot(path=str(OUT/f"{tag}-02-filled.png"),full_page=True)
if state.get('home') is True or state.get('menu_after') is not False: print("ABORT: toggles not as expected"); page.locator("button:has-text('Cancel')").first.click()
else:
    page.locator('#saveAddPage').click(); page.wait_for_timeout(6000); v3.wait_out_of_please_wait(page,30)
    page.screenshot(path=str(OUT/f"{tag}-03-saved.png")); print("URL after save", page.url)
