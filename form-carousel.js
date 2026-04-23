/* =========================================================
   AAPLE Academy Donor Page — Multi-step Carousel
   Transforms DonorPerfect's single-page form into 3 steps.
   ========================================================= */
(function() {
  'use strict';

  function init() {
    // Find the main fields wrapper
    var pnlFields = document.getElementById('pnlFields');
    if (!pnlFields) {
      console.warn('[AAPLE] pnlFields not found - cannot initialize carousel');
      return;
    }

    // Get all DP fieldsets inside pnlFields (in document order)
    var allFieldsets = pnlFields.querySelectorAll('fieldset.wSectionTableCSS');
    if (allFieldsets.length < 3) {
      console.warn('[AAPLE] Expected 3+ fieldsets in form, found ' + allFieldsets.length);
      return;
    }

    // Group fieldsets into 3 steps
    //   Step 1: first fieldset (Donation Information)
    //   Step 2: second fieldset (Contact Information)
    //   Step 3: third through last fieldsets (Payment + CC + Billing)
    var stepGroups = [
      {
        title: 'Choose your gift',
        intro: 'Every contribution directly supports AAPLE students.',
        fieldsets: [allFieldsets[0]],
        trustRow: false
      },
      {
        title: 'Tell us about you',
        intro: "We'll send your tax receipt to the email you provide.",
        fieldsets: [allFieldsets[1]],
        trustRow: false
      },
      {
        title: 'Payment details',
        intro: 'Your information is encrypted and processed securely.',
        fieldsets: Array.prototype.slice.call(allFieldsets, 2),
        trustRow: true
      }
    ];

    // The container that wraps all form sections
    var wrapper = allFieldsets[0].parentElement;

    // Build progress indicator
    var progress = document.createElement('div');
    progress.className = 'aaple-progress';
    var stepLabels = ['Your Gift', 'About You', 'Payment'];
    for (var i = 0; i < 3; i++) {
      var pstep = document.createElement('div');
      pstep.className = 'aaple-progress-step' + (i === 0 ? ' active' : '');
      pstep.dataset.step = String(i + 1);
      pstep.innerHTML =
        '<div class="aaple-dot"><span class="aaple-dot-num">' + (i + 1) + '</span></div>' +
        '<div class="aaple-plabel">' + stepLabels[i] + '</div>';
      progress.appendChild(pstep);
      if (i < 2) {
        var line = document.createElement('div');
        line.className = 'aaple-progress-line';
        progress.appendChild(line);
      }
    }
    wrapper.insertBefore(progress, allFieldsets[0]);

    // Build each step wrapper and move the appropriate fieldsets in
    var stepEls = [];
    for (var s = 0; s < stepGroups.length; s++) {
      var group = stepGroups[s];
      var stepEl = document.createElement('div');
      stepEl.className = 'aaple-step' + (s === 0 ? ' active' : '');
      stepEl.dataset.step = String(s + 1);

      var titleEl = document.createElement('h3');
      titleEl.className = 'aaple-step-title';
      titleEl.textContent = group.title;
      stepEl.appendChild(titleEl);

      var introEl = document.createElement('p');
      introEl.className = 'aaple-step-intro';
      introEl.textContent = group.intro;
      stepEl.appendChild(introEl);

      // Optional trust row at top of Step 3
      if (group.trustRow) {
        var trustRow = document.createElement('div');
        trustRow.className = 'aaple-trust-row';
        trustRow.innerHTML =
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
          '<span>Your payment details are encrypted and processed securely. We never store your card number.</span>';
        stepEl.appendChild(trustRow);
      }

      // Move the fieldsets into this step
      for (var f = 0; f < group.fieldsets.length; f++) {
        stepEl.appendChild(group.fieldsets[f]);
      }

      wrapper.appendChild(stepEl);
      stepEls.push(stepEl);
    }

    // Build navigation buttons
    var nav = document.createElement('div');
    nav.className = 'aaple-nav-buttons';
    var btnBack = document.createElement('button');
    btnBack.type = 'button';
    btnBack.className = 'aaple-btn-back';
    btnBack.hidden = true;
    btnBack.innerHTML = '&larr; Back';
    var btnContinue = document.createElement('button');
    btnContinue.type = 'button';
    btnContinue.className = 'aaple-btn-continue';
    btnContinue.innerHTML = 'Continue &rarr;';
    nav.appendChild(btnBack);
    nav.appendChild(btnContinue);

    var errorBanner = document.createElement('div');
    errorBanner.className = 'aaple-error-banner';
    errorBanner.hidden = true;
    errorBanner.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
      '<span>Please complete the required fields to continue.</span>';

    wrapper.appendChild(errorBanner);
    wrapper.appendChild(nav);

    // Donation amount pill-button active state
    // DP handles the radio selection but Bootstrap's .active class on the label
    // needs to be managed. Bootstrap's data-toggle="buttons" plugin may handle
    // it, but we add safety logic for clicks.
    var amountLabels = wrapper.querySelectorAll('.btn-group[data-toggle="buttons"] label.btn');
    amountLabels.forEach(function(label) {
      label.addEventListener('click', function() {
        setTimeout(function() {
          amountLabels.forEach(function(l) {
            var input = l.querySelector('input[type="radio"]');
            if (input && input.checked) {
              l.classList.add('active');
            } else {
              l.classList.remove('active');
            }
          });
        }, 10);
      });
    });

    // Donation type radio (One-Time / Recurring) active state
    var typeRadios = wrapper.querySelectorAll('label.control.radio input[type="radio"]');
    function updateTypeRadios() {
      typeRadios.forEach(function(radio) {
        var label = radio.closest('label.control.radio');
        if (!label) return;
        if (radio.checked) label.classList.add('aaple-selected');
        else label.classList.remove('aaple-selected');
      });
    }
    typeRadios.forEach(function(radio) {
      radio.addEventListener('change', updateTypeRadios);
    });
    updateTypeRadios(); // initial state

    // Step navigation
    var currentStep = 1;
    var TOTAL_STEPS = 3;
    var progressSteps = progress.querySelectorAll('.aaple-progress-step');
    var progressLines = progress.querySelectorAll('.aaple-progress-line');

    function showStep(n) {
      stepEls.forEach(function(el) {
        el.classList.toggle('active', parseInt(el.dataset.step, 10) === n);
      });
      progressSteps.forEach(function(p) {
        var ps = parseInt(p.dataset.step, 10);
        p.classList.toggle('active', ps === n);
        p.classList.toggle('completed', ps < n);
      });
      progressLines.forEach(function(line, i) {
        line.classList.toggle('filled', (i + 1) < n);
      });
      btnBack.hidden = (n === 1);
      btnContinue.innerHTML = (n === TOTAL_STEPS) ? 'Complete Gift &rarr;' : 'Continue &rarr;';
      errorBanner.hidden = true;
      currentStep = n;
      // Scroll to form top smoothly
      try {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {}
    }

    // Clear invalid styling as user edits
    wrapper.querySelectorAll('input, select').forEach(function(el) {
      var clear = function() { el.classList.remove('aaple-invalid'); };
      el.addEventListener('input', clear);
      el.addEventListener('change', clear);
    });

    // Validation per step — uses DP's required field markers
    function validateStep(n) {
      var stepEl = stepEls[n - 1];
      var valid = true;
      var firstInvalid = null;

      // Step 1: check that an amount is selected and a type
      if (n === 1) {
        var amountChecked = stepEl.querySelector('.btn-group[data-toggle="buttons"] input[type="radio"]:checked');
        if (!amountChecked) {
          valid = false;
          // Visually indicate via the amount group container
          var amountGroup = stepEl.querySelector('.btn-group[data-toggle="buttons"]');
          if (amountGroup && !firstInvalid) firstInvalid = amountGroup;
        } else if (amountChecked.id && amountChecked.id.indexOf('OtherAmount') !== -1) {
          // If "Other" is selected, check the value
          var otherInput = stepEl.querySelector('.otherAmountText');
          if (otherInput && !otherInput.value.trim()) {
            otherInput.classList.add('aaple-invalid');
            valid = false;
            if (!firstInvalid) firstInvalid = otherInput;
          }
        }
        var typeChecked = stepEl.querySelector('label.control.radio input[type="radio"]:checked');
        if (!typeChecked) {
          valid = false;
        }
      }

      // For all steps: find required fields (DP marks them with a specific icon)
      stepEl.querySelectorAll('.form-group').forEach(function(fg) {
        var hasRequiredMark = fg.querySelector('.glyphicon-asterisk.form-control-feedback');
        if (!hasRequiredMark) return;
        var input = fg.querySelector('input.form-control, select.form-control, textarea.form-control');
        if (!input) return;
        // Skip the "Same As Above" billing fields if checkbox is checked
        if (n === 3) {
          var sameAsAbove = document.getElementById('SetInfo');
          if (sameAsAbove && sameAsAbove.checked) {
            // Billing fields are in the "section_Billing Address" fieldset
            var billingFieldset = input.closest('fieldset[id*="Billing"]');
            if (billingFieldset) return;
          }
        }
        var val = (input.value || '').trim();
        var ok = val !== '';
        // Email validation
        if (ok && input.type === 'email') {
          ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
        }
        if (!ok) {
          input.classList.add('aaple-invalid');
          valid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!valid && firstInvalid && firstInvalid.focus) {
        try { firstInvalid.focus({ preventScroll: true }); } catch (e) {}
      }
      return valid;
    }

    btnContinue.addEventListener('click', function() {
      if (!validateStep(currentStep)) {
        errorBanner.hidden = false;
        return;
      }
      if (currentStep < TOTAL_STEPS) {
        showStep(currentStep + 1);
      } else {
        // Final step — trigger DonorPerfect's actual submit button
        var dpSubmit = document.getElementById('btnConfirm12345');
        if (dpSubmit) {
          btnContinue.innerHTML = 'Processing&hellip;';
          btnContinue.disabled = true;
          // DP's button uses WebForm_DoPostBackWithOptions via href; clicking triggers it
          dpSubmit.click();
        } else {
          console.warn('[AAPLE] DP submit button not found');
        }
      }
    });

    btnBack.addEventListener('click', function() {
      if (currentStep > 1) showStep(currentStep - 1);
    });

    // Don't let Enter key submit — advance the step instead
    var form = document.getElementById('thisForm');
    if (form) {
      form.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          // Skip if target is a DP select or inside DP's internals
          if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
          e.preventDefault();
          btnContinue.click();
        }
      });
    }

    console.log('[AAPLE] Carousel initialized with ' + TOTAL_STEPS + ' steps');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Give DP's own scripts a moment to finish their own initialization
    setTimeout(init, 50);
  }
})();
