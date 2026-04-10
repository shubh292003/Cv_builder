/**
 * CV Maker Application Logic
 * This script handles all the dynamic interactivity of the CV builder,
 * including tab switching, live preview updates, and dynamic list management.
 */
document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. Navigation Tabs Setup
       ========================================= */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Add click listeners to all tab buttons to handle switching views
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to the clicked button and corresponding content form
            button.classList.add('active');
            const targetFormId = `${button.dataset.tab}-form`;
            document.getElementById(targetFormId).classList.add('active');
        });
    });

    /* =========================================
       2. Template Selection
       ========================================= */
    const templateRadios = document.querySelectorAll('input[name="template"]');
    
    // Listen for changes in the template selection radio buttons
    templateRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const selectedTemplate = event.target.value;
            const previewContainer = document.getElementById('cv-preview');
            
            // Update the CSS classes on the preview container to apply the new template styling
            previewContainer.className = `cv-document template-${selectedTemplate} glassmorphism`;
        });
    });

    /* =========================================
       3. Simple Input to Preview Mappings
       ========================================= */
    // Map of input field IDs to their corresponding preview element IDs
    const inputToPreviewMap = { 
        'fullName': 'preview-name', 
        'jobTitle': 'preview-title', 
        'email': 'preview-email', 
        'phone': 'preview-phone', 
        'address': 'preview-address', 
        'summary': 'preview-summary' 
    };

    // Attach input listeners to update preview elements in real-time
    for (const [inputId, previewId] of Object.entries(inputToPreviewMap)) {
        const inputElement = document.getElementById(inputId);
        if (!inputElement) continue; // Skip if the input element doesn't exist

        inputElement.addEventListener('input', (event) => {
            const previewElement = document.getElementById(previewId);
            const value = event.target.value;
            const placeholder = event.target.placeholder.replace('e.g. ', '');
            
            // Fallback to placeholder text if input is empty
            previewElement.textContent = value || placeholder;
            
            // Special handling for job title to hide it completely if empty
            if (inputId === 'jobTitle') {
                previewElement.style.display = value ? 'block' : 'none';
            }
        });
    }

    /* =========================================
       4. Special Field Mappings (LinkedIn, Skills)
       ========================================= */
    const linkedinInput = document.getElementById('linkedin');
    if (linkedinInput) {
        linkedinInput.addEventListener('input', (event) => {
            const previewElement = document.getElementById('preview-linkedin');
            const separatorElement = document.getElementById('linkedin-separator');
            const value = event.target.value;
            
            previewElement.textContent = value;
            
            // Toggle visibility of the LinkedIn link and its separator bullet
            const displayStyle = value ? 'inline' : 'none';
            previewElement.style.display = displayStyle;
            if (separatorElement) {
                separatorElement.style.display = displayStyle;
            }
        });
    }

    const skillsInput = document.getElementById('skillsInput');
    if (skillsInput) {
        skillsInput.addEventListener('input', (event) => {
            const previewElement = document.getElementById('preview-skills');
            const value = event.target.value;
            // Provide a default string if skills input is empty
            previewElement.textContent = value || 'JavaScript, React, Node.js';
        });
    }

    /* =========================================
       5. Dynamic List Management (Experience & Education)
       ========================================= */
       
    /**
     * Helper to convert a multi-line string into HTML bullet points (<li>).
     */
    const convertTextToBullets = (text) => {
        if (!text) return '';
        
        return text
            .split('\n')
            .filter(line => line.trim().length > 0) // Remove empty lines
            .map(line => `<li>${line.replace(/^[•\-\*]\s*/, '').trim()}</li>`) // Strip existing bullet characters and wrap in <li>
            .join('');
    };

    /**
     * Core logic to attach a dynamic list (Experience or Education).
     * @param {string} listContainerId - The HTML block where dynamic items are inserted.
     * @param {string} addButtonId - The ID of the button to add a new item.
     * @param {string} itemTemplateHtml - The HTML structure of the new item snippet.
     * @param {function} updatePreviewCallback - The function to call when an item changes or is removed.
     */
    function setupDynamicList(listContainerId, addButtonId, itemTemplateHtml, updatePreviewCallback) {
        const listContainer = document.getElementById(listContainerId);
        const addButton = document.getElementById(addButtonId);

        // Listen for "Add" button clicks
        addButton.addEventListener('click', () => {
            const newListItem = document.createElement('div');
            // e.g., converts 'experience-list' to 'experience-item'
            newListItem.className = listContainerId.replace('-list', '-item'); 
            newListItem.innerHTML = itemTemplateHtml;
            
            // Set up removal logic for the new item
            const removeButton = newListItem.querySelector('.remove-item');
            removeButton.addEventListener('click', () => { 
                newListItem.remove(); 
                updatePreviewCallback(); 
            });
            
            // Re-bind input events to trigger preview updates
            const inputs = newListItem.querySelectorAll('input,textarea');
            inputs.forEach(input => input.addEventListener('input', updatePreviewCallback));
            
            listContainer.appendChild(newListItem);
            updatePreviewCallback();
        });

        // Bind input events for already-existing items on page load
        const existingInputs = listContainer.querySelectorAll('input,textarea');
        existingInputs.forEach(input => input.addEventListener('input', updatePreviewCallback));
    }

    // --- Work Experience Setup ---
    const experienceItemTemplate = `
        <button type="button" class="remove-item" title="Remove Experience"><i class="fas fa-times"></i></button>
        <div class="input-row">
            <div class="input-group"><label>Company</label><input type="text" class="exp-company"></div>
            <div class="input-group"><label>Title</label><input type="text" class="exp-title"></div>
        </div>
        <div class="input-row">
            <div class="input-group"><label>Start Date</label><input type="text" class="exp-start"></div>
            <div class="input-group"><label>End Date</label><input type="text" class="exp-end"></div>
        </div>
        <div class="input-group">
            <label>Description (New line = new bullet)</label>
            <textarea class="exp-desc" rows="4"></textarea>
        </div>
    `;

    const updateExperiencePreview = () => {
        let previewHtml = '';
        const items = document.querySelectorAll('.experience-item');
        
        items.forEach(item => {
            const company = item.querySelector('.exp-company').value || 'Company';
            const title = item.querySelector('.exp-title').value || 'Title';
            const startDate = item.querySelector('.exp-start').value || 'Start';
            const endDate = item.querySelector('.exp-end').value || 'End';
            const description = item.querySelector('.exp-desc').value || 'Developed features.';
            
            previewHtml += `
            <div class="cv-item-ats">
                <div class="cv-item-header-ats">
                    <div class="cv-item-title-ats"><strong>${title}</strong>, <em>${company}</em></div>
                    <div class="cv-item-date-ats">${startDate} - ${endDate}</div>
                </div>
                <ul class="cv-item-desc-ats">
                    ${convertTextToBullets(description)}
                </ul>
            </div>`;
        });
        document.getElementById('preview-experience-list').innerHTML = previewHtml;
    };

    setupDynamicList('experience-list', 'add-experience', experienceItemTemplate, updateExperiencePreview);

    // --- Fresher/Internship Setup ---
    const fresherItemTemplate = `
        <button type="button" class="remove-item" title="Remove Role"><i class="fas fa-times"></i></button>
        <div class="input-row">
            <div class="input-group"><label>Organization / Event</label><input type="text" class="fresh-org"></div>
            <div class="input-group"><label>Role</label><input type="text" class="fresh-role"></div>
        </div>
        <div class="input-row">
            <div class="input-group"><label>Start Date</label><input type="text" class="fresh-start"></div>
            <div class="input-group"><label>End Date</label><input type="text" class="fresh-end"></div>
        </div>
        <div class="input-group">
            <label>Description (New line = new bullet)</label>
            <textarea class="fresh-desc" rows="4"></textarea>
        </div>
    `;

    const fresherModeToggle = document.getElementById('toggle-fresher');
    const fresherFormSection = document.getElementById('fresher-form-section');

    const toggleExperienceSections = () => {
        const isFresherMode = fresherModeToggle && fresherModeToggle.checked;
        const experienceSection = document.getElementById('experience-section');
        const fresherSection = document.getElementById('fresher-section');
        const fresherLabel = fresherModeToggle.closest('.switch-container').querySelector('.switch-label');
        
        if (fresherLabel) {
            fresherLabel.textContent = isFresherMode ? 'Active' : 'Hidden';
        }

        if (isFresherMode) {
            if (experienceSection) experienceSection.classList.add('section-hidden');
            if (fresherSection) fresherSection.classList.remove('section-hidden');
            if (fresherFormSection) {
                fresherFormSection.classList.remove('section-disabled');
                fresherFormSection.style.display = 'block';
            }
        } else {
            if (experienceSection) experienceSection.classList.remove('section-hidden');
            if (fresherSection) fresherSection.classList.add('section-hidden');
            if (fresherFormSection) {
                fresherFormSection.classList.add('section-disabled');
                fresherFormSection.style.display = 'none';
            }
        }
    };

    if (fresherModeToggle) {
        fresherModeToggle.addEventListener('change', toggleExperienceSections);
    }

    const updateFresherPreview = () => {
        let previewHtml = '';
        const items = document.querySelectorAll('.fresher-item');
        
        items.forEach(item => {
            const org = item.querySelector('.fresh-org').value || 'Tech Corp';
            const role = item.querySelector('.fresh-role').value || 'Intern';
            const startDate = item.querySelector('.fresh-start').value || 'Summer';
            const endDate = item.querySelector('.fresh-end').value || '2023';
            const description = item.querySelector('.fresh-desc').value || 'Assisted in frontend UI development.';
            
            const dateStr = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate;
            
            previewHtml += `
            <div class="cv-item-ats">
                <div class="cv-item-header-ats">
                    <div class="cv-item-title-ats"><strong>${role}</strong>, <em>${org}</em></div>
                    <div class="cv-item-date-ats">${dateStr}</div>
                </div>
                <ul class="cv-item-desc-ats">
                    ${convertTextToBullets(description)}
                </ul>
            </div>`;
        });
        
        const previewContainer = document.getElementById('preview-fresher-list');
        if (previewContainer) {
            previewContainer.innerHTML = previewHtml;
        }
        
        toggleExperienceSections();
    };

    setupDynamicList('fresher-list', 'add-fresher', fresherItemTemplate, updateFresherPreview);
    
    // Initialize correct visibility on page load
    toggleExperienceSections();


    // --- Education Setup ---
    const educationItemTemplate = `
        <button type="button" class="remove-item" title="Remove Education"><i class="fas fa-times"></i></button>
        <div class="input-group">
            <label>Institution</label>
            <input type="text" class="edu-school">
        </div>
        <div class="input-row">
            <div class="input-group"><label>Degree</label><input type="text" class="edu-degree"></div>
            <div class="input-group"><label>Year</label><input type="text" class="edu-end"></div>
        </div>
    `;

    const updateEducationPreview = () => {
        let previewHtml = '';
        const items = document.querySelectorAll('.education-item');
        
        items.forEach(item => {
            const school = item.querySelector('.edu-school').value || 'School';
            const degree = item.querySelector('.edu-degree').value || 'Degree';
            const year = item.querySelector('.edu-end').value || 'Year';
            
            previewHtml += `
            <div class="cv-item-ats">
                <div class="cv-item-header-ats">
                    <div class="cv-item-title-ats"><strong>${degree}</strong>, <em>${school}</em></div>
                    <div class="cv-item-date-ats">${year}</div>
                </div>
            </div>`;
        });
        document.getElementById('preview-education-list').innerHTML = previewHtml;
    };

    setupDynamicList('education-list', 'add-education', educationItemTemplate, updateEducationPreview);

    // --- Languages Setup ---
    const languagesInput = document.getElementById('languagesInput');
    if (languagesInput) {
        languagesInput.addEventListener('input', (event) => {
            const previewElement = document.getElementById('preview-languages');
            const value = event.target.value;
            previewElement.textContent = value || 'English, Spanish';
        });
    }

    // Global function to add a language to the input field
    window.addLanguage = function(lang) {
        if (!languagesInput) return;
        
        let currentVal = languagesInput.value.trim();
        if (currentVal.length === 0) {
            languagesInput.value = lang;
        } else if (!currentVal.includes(lang)) { // Avoid exact duplicates loosely
            // Ensure there is a comma
            if (!currentVal.endsWith(',')) {
                languagesInput.value += ', ';
            } else {
                languagesInput.value += ' ';
            }
            languagesInput.value += lang;
        }
        
        // Trigger input event to update preview
        languagesInput.dispatchEvent(new Event('input'));
    };

    // Global function to add a skill to the skills input field
    window.addSkill = function(skill) {
        if (!skillsInput) return;
        
        let currentVal = skillsInput.value.trim();
        if (currentVal.length === 0) {
            skillsInput.value = skill;
        } else if (!currentVal.toLowerCase().includes(skill.toLowerCase())) {
            if (!currentVal.endsWith(',')) {
                skillsInput.value += ', ';
            } else {
                skillsInput.value += ' ';
            }
            skillsInput.value += skill;
        }
        
        // Trigger input event to update preview
        skillsInput.dispatchEvent(new Event('input'));
    };

    // Global function to set a pre-designed professional summary
    window.setSummary = function(profession) {
        const summaryInput = document.getElementById('summary');
        if (!summaryInput) return;
        
        const summaries = {
            'Software Engineer': 'Results-driven Software Engineer with a strong track record of designing and developing scalable web applications. Proficient in full-stack development using modern technologies and agile methodologies.',
            'Web Developer': 'Passionate Web Developer with expertise in building responsive, accessible, and high-performance websites. Skilled in frontend frameworks, backend integrations, and modern web standards.',
            'Web Designer': 'Creative Web Designer dedicated to crafting visually stunning and highly intuitive user interfaces. Experienced in modern design tools, wireframing, typography, and translating brand identity into engaging web experiences.',
            'Marketing': 'Creative and analytical Marketing professional with a proven track record of executing successful campaigns that drive brand awareness, engagement, and measurable ROI.',
            'Design': 'Innovative Designer specializing in visual branding and digital creations. Dedicated to creating compelling designs that communicate complex ideas effectively and beautifully.',
            'Project Management': 'Highly organized Project Manager with excellent communication skills. Experienced in leading cross-functional teams to deliver complex, large-scale projects on time and under budget.',
            'Data Analysis': 'Detail-oriented Data Analyst adept at analyzing complex datasets to uncover actionable insights. Skilled in data querying, statistical modeling, and creating interactive data visualizations.'
        };
        
        if (summaries[profession]) {
            summaryInput.value = summaries[profession];
            // Trigger input event to update preview
            summaryInput.dispatchEvent(new Event('input'));
        }
    };

    // --- Projects Setup ---
    const projectItemTemplate = `
        <button type="button" class="remove-item" title="Remove Project"><i class="fas fa-times"></i></button>
        <div class="input-row">
            <div class="input-group"><label>Project Name</label><input type="text" class="proj-name"></div>
            <div class="input-group"><label>Technologies/Role</label><input type="text" class="proj-tech"></div>
        </div>
        <div class="input-row">
            <div class="input-group"><label>Date / Year</label><input type="text" class="proj-date"></div>
            <div class="input-group"><label>Link (optional)</label><input type="text" class="proj-link"></div>
        </div>
        <div class="input-group">
            <label>Description (New line = new bullet)</label>
            <textarea class="proj-desc" rows="4"></textarea>
        </div>
    `;

    const updateProjectPreview = () => {
        let previewHtml = '';
        const items = document.querySelectorAll('.projects-item');
        
        items.forEach(item => {
            const name = item.querySelector('.proj-name').value || 'Portfolio Website';
            const tech = item.querySelector('.proj-tech').value || 'HTML, CSS, JS';
            const date = item.querySelector('.proj-date').value || '2023';
            const link = item.querySelector('.proj-link').value || '';
            const description = item.querySelector('.proj-desc').value || 'Designed and developed a personal portfolio website.';
            
            const titleHtml = link ? `<a href="${link}" target="_blank" style="color: inherit; text-decoration: none;"><strong>${name}</strong></a>` : `<strong>${name}</strong>`;
            
            previewHtml += `
            <div class="cv-item-ats">
                <div class="cv-item-header-ats">
                    <div class="cv-item-title-ats">${titleHtml}, <em>${tech}</em></div>
                    <div class="cv-item-date-ats">${date}</div>
                </div>
                <ul class="cv-item-desc-ats">
                    ${convertTextToBullets(description)}
                </ul>
            </div>`;
        });
        document.getElementById('preview-projects-list').innerHTML = previewHtml;
    };

    setupDynamicList('projects-list', 'add-project', projectItemTemplate, updateProjectPreview);
    
    // --- Project Toggle Logic ---
    const projectToggle = document.getElementById('toggle-projects');
    const projectPreviewSection = document.getElementById('preview-projects-section');
    const projectsList = document.getElementById('projects-list');
    
    if (projectToggle && projectPreviewSection) {
        const projectLabel = projectToggle.closest('.switch-container').querySelector('.switch-label');
        
        const updateProjectState = () => {
            const isChecked = projectToggle.checked;
            if (projectLabel) projectLabel.textContent = isChecked ? 'Visible' : 'Hidden';
            
            if (isChecked) {
                projectPreviewSection.classList.remove('section-hidden');
                if (projectsList) projectsList.classList.remove('section-disabled');
            } else {
                projectPreviewSection.classList.add('section-hidden');
                if (projectsList) projectsList.classList.add('section-disabled');
            }
        };

        projectToggle.addEventListener('change', updateProjectState);
        updateProjectState();
    }

});
