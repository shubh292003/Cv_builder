document.addEventListener('DOMContentLoaded', () => {
    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-form`).classList.add('active');
    }));

    // Templates
    document.querySelectorAll('input[name="template"]').forEach(radio => {
        radio.addEventListener('change', e => {
            document.getElementById('cv-preview').className = `cv-document template-${e.target.value} glassmorphism`;
        });
    });

    // Simple mappings
    const maps = { 'fullName': 'preview-name', 'jobTitle': 'preview-title', 'email': 'preview-email', 'phone': 'preview-phone', 'address': 'preview-address', 'summary': 'preview-summary' };
    for (const [inId, outId] of Object.entries(maps)) {
        const el = document.getElementById(inId);
        if(!el) continue;
        el.addEventListener('input', e => {
            const outEl = document.getElementById(outId);
            outEl.textContent = e.target.value || e.target.placeholder.replace('e.g. ','');
            if(inId==='jobTitle') outEl.style.display = e.target.value ? 'block' : 'none';
        });
    }

    // LinkedIn
    const ln = document.getElementById('linkedin');
    if(ln) {
        ln.addEventListener('input', e => {
            const out = document.getElementById('preview-linkedin');
            const sep = document.getElementById('linkedin-separator');
            out.textContent = e.target.value;
            out.style.display = e.target.value ? 'inline' : 'none';
            if(sep) sep.style.display = e.target.value ? 'inline' : 'none';
        });
    }

    // Skills
    const sk = document.getElementById('skillsInput');
    if(sk) {
        sk.addEventListener('input', e => {
            document.getElementById('preview-skills').textContent = e.target.value || 'JavaScript, React, Node.js';
        });
    }

    // Bullet helper
    const toBullets = txt => txt ? txt.split('\n').filter(l=>l.trim()).map(l=>`<li>${l.replace(/^[•\-\*]\s*/,'').trim()}</li>`).join('') : '';

    // Dynamic Lists
    function attachList(listId, btnId, template, updateFn) {
        const list = document.getElementById(listId);
        document.getElementById(btnId).addEventListener('click', () => {
            const div = document.createElement('div');
            div.className = listId.replace('-list','-item');
            div.innerHTML = template;
            div.querySelector('.remove-item').addEventListener('click', () => { div.remove(); updateFn(); });
            div.querySelectorAll('input,textarea').forEach(i => i.addEventListener('input', updateFn));
            list.appendChild(div);
            updateFn();
        });
        list.querySelectorAll('input,textarea').forEach(i => i.addEventListener('input', updateFn));
    }

    // Work Experience
    const expTpl = `<button type="button" class="remove-item"><i class="fas fa-times"></i></button><div class="input-row"><div class="input-group"><label>Company</label><input type="text" class="exp-company"></div><div class="input-group"><label>Title</label><input type="text" class="exp-title"></div></div><div class="input-row"><div class="input-group"><label>Start</label><input type="text" class="exp-start"></div><div class="input-group"><label>End</label><input type="text" class="exp-end"></div></div><div class="input-group"><label>Desc (New line = bullet)</label><textarea class="exp-desc" rows="4"></textarea></div>`;
    const updExp = () => {
        let h = '';
        document.querySelectorAll('.experience-item').forEach(el => {
            const co = el.querySelector('.exp-company').value || 'Company';
            const ti = el.querySelector('.exp-title').value || 'Title';
            const st = el.querySelector('.exp-start').value || 'Start';
            const en = el.querySelector('.exp-end').value || 'End';
            const de = el.querySelector('.exp-desc').value || 'Developed features.';
            h += `<div class="cv-item-ats"><div class="cv-item-header-ats"><div class="cv-item-title-ats"><strong>${ti}</strong>, <em>${co}</em></div><div class="cv-item-date-ats">${st} - ${en}</div></div><ul class="cv-item-desc-ats">${toBullets(de)}</ul></div>`;
        });
        document.getElementById('preview-experience-list').innerHTML = h;
    };
    attachList('experience-list', 'add-experience', expTpl, updExp);

    // Education
    const eduTpl = `<button type="button" class="remove-item"><i class="fas fa-times"></i></button><div class="input-group"><label>Institution</label><input type="text" class="edu-school"></div><div class="input-row"><div class="input-group"><label>Degree</label><input type="text" class="edu-degree"></div><div class="input-group"><label>Year</label><input type="text" class="edu-end"></div></div>`;
    const updEdu = () => {
        let h = '';
        document.querySelectorAll('.education-item').forEach(el => {
            const sc = el.querySelector('.edu-school').value || 'School';
            const dg = el.querySelector('.edu-degree').value || 'Degree';
            const yr = el.querySelector('.edu-end').value || 'Year';
            h += `<div class="cv-item-ats"><div class="cv-item-header-ats"><div class="cv-item-title-ats"><strong>${dg}</strong>, <em>${sc}</em></div><div class="cv-item-date-ats">${yr}</div></div></div>`;
        });
        document.getElementById('preview-education-list').innerHTML = h;
    };
    attachList('education-list', 'add-education', eduTpl, updEdu);
});
