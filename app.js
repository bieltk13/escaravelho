(()=>{
  'use strict';
  const menuButton=document.querySelector('.menu-toggle');
  const nav=document.getElementById('primary-navigation');
  const closeMenu=()=>{if(!menuButton||!nav)return;nav.classList.remove('is-open');menuButton.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menu');};
  if(menuButton&&nav){
    menuButton.addEventListener('click',()=>{const expanded=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!expanded));menuButton.setAttribute('aria-label',expanded?'Abrir menu':'Fechar menu');nav.classList.toggle('is-open',!expanded);menuButton.classList.toggle('is-open',!expanded);});
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
    document.addEventListener('click',e=>{if(nav.classList.contains('is-open')&&!nav.contains(e.target)&&!menuButton.contains(e.target))closeMenu();});
  }
  // Real photos are attempted from the public partner gallery. Offline demo assets keep the site usable.
  document.querySelectorAll('img[data-fallback]').forEach(img=>{
    const useFallback=()=>{const local=img.dataset.fallback;if(local&&!img.src.endsWith(local)){img.src=local;img.dataset.source='illustrative';}};
    img.addEventListener('error',useFallback,{once:true});
    if(img.complete && img.naturalWidth===0)useFallback();
  });
  const year=document.getElementById('year');if(year)year.textContent=String(new Date().getFullYear());
  const form=document.getElementById('aula-form');
  if(form){
    const feedback=document.getElementById('form-error');
    const showError=msg=>{feedback.textContent=msg;feedback.hidden=false;};
    const clearError=()=>{feedback.textContent='';feedback.hidden=true;};
    form.addEventListener('input',clearError);
    form.addEventListener('change',clearError);
    form.addEventListener('submit',(event)=>{
      event.preventDefault();clearError();
      const nome=form.elements.nome.value.trim().replace(/\s+/g,' ');
      const periodo=form.elements.periodo.value;
      if(nome.length<2){showError('Informe seu nome para preparar a mensagem.');form.elements.nome.focus();return;}
      if(!periodo){showError('Selecione o período em que prefere treinar.');form.elements.periodo.focus();return;}
      if(!form.elements.consentimento.checked){showError('Confirme que entendeu como a solicitação será enviada.');form.elements.consentimento.focus();return;}
      const exp=form.elements.experiencia.value;
      const obs=form.elements.observacao.value.trim().slice(0,260);
      const lines=[
        'Olá! Conheci o Escaravelho Box pela demonstração do site e gostaria de solicitar uma aula gratuita.',
        '',
        `Nome: ${nome}`,
        `Experiência: ${exp}`,
        `Período de preferência: ${periodo}`,
        ...(obs?[`Dúvida: ${obs}`]:[]),
        '',
        'Podem me informar os horários disponíveis e como confirmar a primeira aula?'
      ];
      const url=`https://wa.me/5545999658925?text=${encodeURIComponent(lines.join('\n'))}`;
      // User-initiated click. No automatic booking and no personal data stored on this site.
      const windowRef=window.open(url,'_blank');
      if(windowRef){try{windowRef.opener=null;}catch(_){/* janela isolada pelo navegador */}}
      else{window.location.href=url;}
      if(typeof window.dataLayer!=='undefined' && Array.isArray(window.dataLayer))window.dataLayer.push({event:'solicitacao_whatsapp_iniciada',origem:'aula_gratuita'});
    });
  }
})();
