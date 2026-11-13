/* Shared behaviour for the Portuguese and English portfolio. */
(() => {
'use strict';
const pt = document.documentElement.lang.startsWith('pt');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const nav = document.getElementById('mainNav');
const menu = document.getElementById('navbarNav');
const topButton = document.getElementById('toTop');
const progress = document.getElementById('scrollProgress');
const toggle = document.querySelector('.experience-toggle');
const experience = document.getElementById('fullExperience');
if (toggle && experience) {
experience.addEventListener('show.bs.collapse', () => { toggle.textContent = pt ? 'Ver menos' : 'Show less'; });
experience.addEventListener('hide.bs.collapse', () => { toggle.textContent = pt ? 'Ver mais' : 'Show more'; });
}
menu?.addEventListener('show.bs.collapse', () => nav.classList.add('mobile-open'));
menu?.addEventListener('hidden.bs.collapse', () => nav.classList.remove('mobile-open'));
const navLinks = [...document.querySelectorAll('#navbarNav a[href^="#"]')];
navLinks.forEach(link => link.addEventListener('click', () => {
if (window.bootstrap) bootstrap.Collapse.getInstance(menu)?.hide();
}));
function onScroll() {
nav?.classList.toggle('scrolled', window.scrollY > 40);
if (topButton) { topButton.hidden = window.scrollY < 500; topButton.classList.toggle('show', !topButton.hidden); }
const maximum = document.documentElement.scrollHeight - window.innerHeight;
if (progress) progress.style.width = (maximum > 0 ? Math.min(100, window.scrollY / maximum * 100) : 0) + '%';
let active = '';
navLinks.forEach(link => { const target = document.querySelector(link.getAttribute('href')); if (target && target.getBoundingClientRect().top <= 160) active = link.getAttribute('href'); });
navLinks.forEach(link => { const selected = link.getAttribute('href') === active; link.classList.toggle('active', selected); if (selected) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
}
window.addEventListener('scroll', onScroll, {passive:true});
window.addEventListener('resize', onScroll);
onScroll();
topButton?.addEventListener('click', () => window.scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'}));

// Filter the complete archive, counting individual contributions rather than repeated highlights.
const archive = document.querySelector('#articles .accordion');
const search = document.getElementById('publicationSearch');
const year = document.getElementById('publicationYear');
const type = document.getElementById('publicationType');
const topic = document.getElementById('publicationTopic');
const count = document.getElementById('publicationCount');
const empty = document.getElementById('publicationEmpty');
const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
if (archive && search && year && type && topic) {
const groups = [...archive.querySelectorAll('.accordion-item')];
const initialOpen = new Set([...archive.querySelectorAll('.accordion-collapse.show')].map(el=>el.id));
const records = [];
const typePatterns = [/^(artigo|paper):/,/^(apresentacao|presentation):/,/^(resumo|resumo alargado|abstract|extended abstract):/,/^(comunicacao|communication):/,/^(participacao|participation):/];
const topicPatterns = [/bim|gis|sig|digital|autodesk|esri|information requirements/,/tunnel|tune|geotec|geotechn|underground|subterr|microtun|natm|tbm/,/water|agua|drenagem|drainage|climat|resilien|flood|inund/];
groups.forEach(group => {
const y = group.querySelector('.accordion-button').textContent.trim();
year.add(new Option(y,y));
group.querySelectorAll('.article-card').forEach(card => {
const column = card.closest('.col-md-6') || card.parentElement;
const title = normalise(card.querySelector('h6')?.textContent || '');
const items = [...card.querySelectorAll('li')];
items.forEach(item => records.push({item,card,column,group,year:y,text:normalise(title+' '+item.textContent),type: typePatterns.findIndex(re=>re.test(normalise(item.textContent.trim())))}));
});
});
const featured = archive.previousElementSibling; // Status elements are handled separately below.
const highlights = document.querySelector('#articles .row.g-4.mb-4');
function filter() {
const query = normalise(search.value.trim());
const terms = query.split(/\s+/).filter(Boolean);
const active = !!(query || year.value || type.value || topic.value);
let total = 0;
records.forEach(record => {
const matches = terms.every(term=>record.text.includes(term)) && (!year.value || record.year===year.value) && (type.value==='' || record.type===Number(type.value)) && (topic.value==='' || topicPatterns[Number(topic.value)].test(record.text));
record.item.hidden = !matches;
if (matches) total++;
});
const columns = new Set(records.map(r=>r.column));
columns.forEach(column => { column.hidden = !records.some(r=>r.column===column&&!r.item.hidden); });
groups.forEach(group => {
group.hidden = !records.some(r=>r.group===group&&!r.item.hidden);
const panel=group.querySelector('.accordion-collapse'), button=group.querySelector('.accordion-button');
const open=active?!group.hidden:initialOpen.has(panel.id);
panel.classList.toggle('show',open);button.classList.toggle('collapsed',!open);button.setAttribute('aria-expanded',String(open));
});
if (highlights) highlights.hidden = active;
count.textContent = total + (pt ? (total === 1 ? ' contribuição no arquivo' : ' contribuições no arquivo') : (total === 1 ? ' contribution in the archive' : ' contributions in the archive'));
empty.hidden = total!==0;
}
[search,year,type,topic].forEach(control=>control.addEventListener(control===search?'input':'change',filter));
document.getElementById('publicationReset').addEventListener('click',()=>{search.value='';year.value='';type.value='';topic.value='';filter();search.focus();});
filter();
}

// Gallery: previous/next buttons and arrow keys, with captions and meaningful alt text.
const lightbox=document.getElementById('lightbox');
const images=[...document.querySelectorAll('#gallery a[data-bs-img]')];
let current=0;
const image=document.getElementById('lightbox-img');
const caption=document.getElementById('lightbox-cap');
function showImage(index) {
if(!images.length)return;
current=(index+images.length)%images.length;
const trigger=images[current];
image.src=trigger.dataset.bsImg;
image.alt=trigger.dataset.bsCaption||trigger.querySelector('img')?.alt||'';
caption.textContent=trigger.dataset.bsCaption||'';
document.getElementById('galleryPosition').textContent=(current+1)+' / '+images.length;
}
lightbox?.addEventListener('show.bs.modal',event=>{const index=images.indexOf(event.relatedTarget);showImage(index<0?0:index);});
document.getElementById('galleryPrev')?.addEventListener('click',()=>showImage(current-1));
document.getElementById('galleryNext')?.addEventListener('click',()=>showImage(current+1));
lightbox?.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();showImage(current-1);}if(event.key==='ArrowRight'){event.preventDefault();showImage(current+1);}});
lightbox?.addEventListener('hidden.bs.modal',()=>{image.removeAttribute('src');image.alt='';});
})();
