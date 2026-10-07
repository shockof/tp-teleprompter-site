const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

// A guided, local simulation built from the app's real screenshots.
const demoImage = document.querySelector('#demo-image');
const demoHint = document.querySelector('#demo-hint');
const demoCaption = document.querySelector('#demo-caption span');
const demoHotspots = document.querySelector('#demo-hotspots');
const demoRedactions = document.querySelector('#demo-redactions');
if (demoImage && demoHotspots && demoRedactions) {
  const state = {
    screen: 1, role: '', playing: false, progress: 0, elapsed: 0,
    fontSize: 100, alignment: 'Centro', mode: 'Automático', speed: 40, baseWpm: 130,
    mirrorX: false, mirrorY: false, background: 'Preto', textColor: 'Branco',
    bold: false, uppercase: false, selectedTag: 0, newScript: false, deleted: false,
    folders: ['Pasta teste'], currentFolder: null, scriptFolder: null, addMenu: false, folderName: 'Nova pasta',
    annotations: ['As anotações são observações enviadas pelo Display Diretor durante a apresentação. Elas ficam reunidas com o roteiro correspondente para o operador consultar, compartilhar ou excluir depois.'], confirmDeleteAll: false,
    title: 'BOAS-VINDAS',
    body: '# BOAS-VINDAS\nOlá! Seja bem-vindo ao TP Teleprompter.\nPrepare seus textos, organize as falas em blocos e apresente com mais tranquilidade.\n\n# ORGANIZE SEU ROTEIRO\nUse as tags para separar assuntos e encontrar rapidamente cada trecho durante a leitura.\nAjuste o tamanho, as cores e a velocidade para deixar tudo confortável para você.\n\n# PRONTO PARA COMEÇAR\nConecte o Control ao Display, escolha a função do aparelho e inicie sua apresentação.\nDesejamos uma ótima experiência!',
    tagColors: ['#ed00df', '#35ee27', '#ff5722']
  };
  let discoveryTimer = null;
  let playbackTimer = null;
  const screenNames = { 1:'Conexão', 2:'Display encontrado', 3:'Escolha de tela', 4:'Roteiros', 5:'Leitura do roteiro', 6:'Tags e blocos', 7:'Formatação', 8:'Ações do roteiro', 9:'Editar roteiro', 10:'Anotações do diretor', 11:'Pastas', 12:'Nova pasta' };
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const parseScript = () => {
    const lines = state.body.split(/\n/); const tags = []; const blocks = []; let current = null;
    lines.forEach((line) => {
      const value = line.trim();
      if (value.startsWith('#')) {
        current = { tag: value.replace(/^#+\s*/, '') || 'Marcador', lines: [] };
        tags.push(current.tag); blocks.push(current);
      } else if (value) {
        if (!current) { current = { tag: state.title || 'Roteiro', lines: [] }; blocks.push(current); }
        current.lines.push(value);
      }
    });
    while (state.tagColors.length < tags.length) state.tagColors.push(['#39FF14','#FF5F1F','#FF10F0','#00FFFF','#FFFF33','#BF00FF'][state.tagColors.length % 6]);
    state.tagColors.length = tags.length;
    return { text: blocks.flatMap((block) => block.lines), tags, blocks };
  };
  const bodyParagraphs = (blocks) => blocks.map((block, index) => block.lines.map((line) => `<p data-block-index="${index}">${state.bold ? '<strong>' : ''}${esc(state.uppercase ? line.toUpperCase() : line)}${state.bold ? '</strong>' : ''}</p>`).join('')).join('');
  const clearPlayback = () => { clearInterval(playbackTimer); playbackTimer = null; state.playing = false; };
  const go = (screen) => {
    if (screen !== 5) clearPlayback();
    if (screen !== 1) clearTimeout(discoveryTimer);
    state.screen = screen;
    render();
  };
  const hotspot = (action, label, x, y, w, h, classes = '') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `demo-hotspot ${classes}`;
    button.dataset.action = action;
    button.setAttribute('aria-label', label);
    Object.assign(button.style, { left:`${x}%`, top:`${y}%`, width:`${w}%`, height:`${h}%` });
    demoHotspots.append(button);
  };
  const redact = (html) => { demoRedactions.innerHTML += html; };
  const render = () => {
    const screen = state.screen;
    const screenshot = screen <= 9 ? screen : 4;
    demoImage.src = `assets/tela-app-${screenshot}.png`;
    demoImage.style.visibility = screen > 9 ? 'hidden' : 'visible';
    demoImage.alt = `Captura real do app: ${screenNames[screen]}`;
    demoHotspots.replaceChildren(); demoRedactions.replaceChildren();
    let hint = ''; let caption = screenNames[screen];

    if (screen === 1) {
      hint = 'Procurando Displays automaticamente. A lista aparece quando um aparelho é encontrado.';
      hotspot('open-scripts', 'Abrir roteiros', 76, 91, 18, 7);
      clearTimeout(discoveryTimer);
      discoveryTimer = setTimeout(() => { if (state.screen === 1) go(2); }, 1600);
    } else if (screen === 2) {
      hint = 'Display encontrado. Toque no nome do aparelho para escolher sua função.';
      hotspot('choose-display', 'Selecionar o iPad conectado', 10, 27, 82, 8);
      hotspot('open-scripts', 'Abrir roteiros', 76, 91, 18, 7);
    } else if (screen === 3) {
      hint = state.role ? `Função selecionada: ${state.role}. Toque em Continuar.` : 'Escolha o papel deste Display e toque em Continuar.';
      hotspot('role-camera', 'Escolher Câmera TP', 22, 7, 56, 9, state.role === 'Câmera (TP)' ? 'hotspot-active' : '');
      hotspot('role-director', 'Escolher Diretor preview', 22, 16, 56, 9, state.role === 'Diretor (preview)' ? 'hotspot-active' : '');
      hotspot('continue', 'Continuar', 35, 35, 32, 6, state.role ? 'hotspot-ready' : '');
    } else if (screen === 4) {
      hint = state.currentFolder ? `Pasta “${state.currentFolder}”. Toque no roteiro ou use + para adicionar outro nesta pasta.` : state.deleted ? 'Roteiro removido da demonstração. Use + para criar outro.' : 'Toque no roteiro para ler, na seta para ver ações ou em + para criar.';
      hotspot('back-connect', state.currentFolder ? 'Voltar à biblioteca' : 'Voltar para conexão', 3, 6, 15, 8);
      hotspot('manage-displays', 'Gerenciar Displays conectados', 84, 6, 13, 8);
      const visibleFolders = state.folders.slice(0, 3);
      if (state.currentFolder) {
        hotspot('open-script', 'Abrir o roteiro', 5, 14, 75, 8);
        hotspot('script-actions', 'Abrir ações do roteiro', 80, 14, 15, 8);
      } else {
        visibleFolders.forEach((folder, index) => hotspot(`open-folder-${index}`, `Abrir pasta ${folder}`, 5, 14 + index * 7.5, 90, 6.5));
      }
      const notesTitleTop = 11.8 + Math.max(0, visibleFolders.length - 1) * 7.5;
      const notesCardTop = notesTitleTop + 3.2;
      const scriptTitleTop = notesCardTop + 10;
      const scriptCardTop = scriptTitleTop + 3.2;
      if (!state.currentFolder) {
        hotspot('open-annotations', 'Abrir anotações do diretor', 5, 12 + notesCardTop * .88, 90, 8);
        hotspot('open-script', 'Abrir o roteiro', 5, 12 + scriptCardTop * .88, 75, 8);
        hotspot('script-actions', 'Abrir ações do roteiro', 80, 12 + scriptCardTop * .88, 15, 8);
      }
      hotspot('add-menu', 'Adicionar roteiro ou pasta', 82, 89, 16, 9);
      caption = state.currentFolder || 'Biblioteca de roteiros';
      const folderRows = visibleFolders.length ? visibleFolders.map((folder, index) => `<div class="library-card folder-card" style="top:${4.5 + index * 7.5}%"><svg class="folder-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H12z" fill="#1688ff"/></svg><span>${esc(folder)}</span><b>›</b></div>`).join('') : `<div class="library-card folder-card" style="top:4.5%"><span>Nenhuma pasta</span></div>`;
      const libraryContent = state.currentFolder
        ? `<strong class="library-section-title folders-title">${esc(state.currentFolder)}</strong><div class="library-card script-card" style="top:4.5%"><strong>${state.scriptFolder === state.currentFolder && !state.deleted ? esc(state.title) : 'Nenhum roteiro nesta pasta'}</strong><small>${state.scriptFolder === state.currentFolder && !state.deleted ? `# ${esc(parseScript().tags[0] || 'ROTEIRO')}...` : 'Use + para adicionar um roteiro'}</small><b>›</b></div>`
        : `<strong class="library-section-title folders-title">Pastas</strong>${folderRows}<strong class="library-section-title notes-title" style="top:${notesTitleTop}%">Anotações do diretor</strong><div class="library-card notes-card" style="top:${notesCardTop}%"><strong>Como funcionam as anotações</strong><small>${state.annotations.length} ${state.annotations.length === 1 ? 'anotação' : 'anotações'}</small><b>›</b></div><strong class="library-section-title script-title" style="top:${scriptTitleTop}%">Acionar roteiro</strong><div class="library-card script-card" style="top:${scriptCardTop}%"><strong>${state.deleted ? 'ROTEIRO REMOVIDO' : esc(state.title)}</strong><small>${state.deleted ? 'Toque em + para criar outro' : `# ${esc(parseScript().tags[0] || 'ROTEIRO')}...`}</small><b>›</b></div>`;
      redact(`<div class="redact library-page">${libraryContent}<div class="library-plus">＋</div></div>`);
      if (state.addMenu) {
        redact(`<div class="redact library-menu"><strong>Adicionar</strong><span>Novo roteiro</span>${state.currentFolder ? '' : '<span>Nova pasta</span>'}<span>Cancelar</span></div>`);
        hotspot('add-script-option','Novo roteiro',30,47,40,8);
        if (!state.currentFolder) hotspot('add-folder-option','Nova pasta',30,56,40,8);
        hotspot('close-add-menu','Cancelar',30,65,40,7);
      }
    } else if (screen === 5) {
      hint = state.playing ? `Leitura em andamento · ${state.mode} · ${state.speed}%` : 'Toque nas áreas do app para usar Play, Tags, AA, velocidade, Reverse e Stop & Reset.';
      hotspot('back-scripts', 'Voltar aos roteiros', 3, 6, 14, 7);
      hotspot('tags', 'Abrir tags e blocos', 66, 6, 18, 6);
      hotspot('format', 'Abrir formatação do texto', 84, 6, 13, 6);
      hotspot('speed-down', 'Diminuir velocidade', 5, 20, 10, 6);
      hotspot('speed-up', 'Aumentar velocidade', 15, 20, 10, 6);
      hotspot('mode-auto', 'Selecionar modo automático', 25, 20, 34, 6);
      hotspot('mode-manual', 'Selecionar modo manual', 60, 20, 35, 6);
      hotspot('reset', 'Stop e reset', 4, 74, 45, 8);
      hotspot('reverse', 'Reverter leitura', 52, 74, 44, 8);
      hotspot('play', state.playing ? 'Pausar leitura' : 'Iniciar leitura', 4, 83, 92, 15, 'hotspot-play');
      caption = state.playing ? 'Leitura em andamento' : 'Teleprompter';
      redact(`<div class="redact reading-mode"><span class="speed-readout">− &nbsp;${state.speed}%&nbsp; +</span><span class="reader-mode-auto ${state.mode === 'Automático' ? 'is-selected' : ''}">Automático</span><span class="reader-mode-manual ${state.mode === 'Manual' ? 'is-selected' : ''}">Manual</span><small>${Math.round(state.speed * 3.25)} PPM</small></div>`);
      const parsed = parseScript();
      const safeIndex = Math.min(state.selectedTag, Math.max(0, parsed.blocks.length - 1));
      const readingColor = state.background === 'Branco' && state.textColor === 'Branco' ? '#111' : state.textColor === 'Amarelo' ? '#ffd600' : '#fff';
      redact(`<div class="redact reading" style="background:${state.background === 'Branco' ? '#f1f1f1' : '#1c1c1e'};color:${readingColor};text-align:${state.alignment === 'Centro' ? 'center' : state.alignment === 'Esquerda' ? 'left' : 'right'};transform:scaleX(${state.mirrorX ? '-1' : '1'}) scaleY(${state.mirrorY ? '-1' : '1'});--reader-font:${Math.round(state.fontSize / 8)}px"><span class="reading-rule"></span><strong>${esc(parsed.blocks[safeIndex]?.tag || state.title)}</strong>${bodyParagraphs(parsed.blocks)}<span class="reading-rule"></span></div>`);
      if (safeIndex > 0) { const reading = demoRedactions.querySelector('.reading'); const paragraph = reading?.querySelector(`[data-block-index="${safeIndex}"]`); if (reading && paragraph) reading.scrollTop = paragraph.offsetTop - reading.offsetTop; }
      redact(`<div class="redact reading-title">${esc(state.title)}</div><div class="redact play-demo"><strong>${state.playing ? 'Ⅱ  Pausar' : '▶  Play'}</strong><div class="demo-progress"><span style="width:${state.progress}%"></span></div><small>DEMONSTRAÇÃO DA LEITURA · <span class="demo-time">${String(Math.floor(state.elapsed/60)).padStart(2,'0')}:${String(state.elapsed%60).padStart(2,'0')}</span></small></div>`);
    } else if (screen === 6) {
      const { tags } = parseScript();
      const safeIndex = Math.min(state.selectedTag, Math.max(0, tags.length - 1));
      hint = `Bloco selecionado: ${tags[safeIndex] || 'nenhum'}. Toque num bloco para ir até ele.`;
      hotspot('back-reading', 'Fechar tags e voltar à leitura', 3, 6, 28, 8);
      tags.forEach((tag, index) => hotspot(`select-tag-${index}`, `Selecionar bloco ${tag}`, 8, 19 + index * 7, 84, 6));
      caption = 'Tags e blocos';
      redact(`<div class="redact tags">${tags.map((tag,index) => `<span><i style="background:${state.tagColors[index]}"></i>${esc(tag)}</span>`).join('')}</div>`);
    } else if (screen === 7) {
      hint = `Fonte ${state.fontSize} · alinhamento ${state.alignment} · espelhos ${state.mirrorX?'H':'—'}/${state.mirrorY?'V':'—'} · fundo ${state.background} · texto ${state.textColor}`;
      hotspot('font-down','Diminuir fonte',70,19,12,8); hotspot('font-up','Aumentar fonte',83,19,13,8);
      hotspot('align-left','Alinhar à esquerda',9,31,31,7); hotspot('align-center','Centralizar',39,31,30,7); hotspot('align-right','Alinhar à direita',68,31,27,7);
      hotspot('mirror-x','Alternar espelho horizontal',78,42,18,6); hotspot('mirror-y','Alternar espelho vertical',78,49,18,6);
      hotspot('background-color','Alternar cor de fundo',68,61,28,7); hotspot('text-color','Alternar cor do texto',68,68,28,7);
      hotspot('ready','Concluir formatação',72,6,24,8); caption = 'Formatação';
    } else if (screen === 8) {
      hint = 'Edite o roteiro ou simule a exclusão; nada é apagado fora desta demonstração.';
      hotspot('edit-from-menu','Editar roteiro',56,17,20,10); hotspot('delete-demo','Excluir roteiro',78,17,19,10);
      caption = 'Ações do roteiro';
      redact(`<div class="redact library"><strong>${esc(state.title)}</strong><small># BOAS-VINDAS · 3 BLOCOS</small></div>`);
    } else if (screen === 9) {
      hint = 'Edite título e texto, escolha cores de tags e ajuste o estilo antes de salvar.';
      hotspot('save','Salvar roteiro',72,6,24,8); hotspot('cancel','Cancelar edição',3,6,27,8);
      caption = state.newScript ? 'Novo roteiro' : 'Editar roteiro';
      redact(`<div class="redact editor-title" contenteditable="true" role="textbox" aria-label="Título do roteiro">${state.newScript ? 'NOVO ROTEIRO' : esc(state.title)}</div>`);
      redact(`<div class="redact editor-copy" contenteditable="true" role="textbox" aria-label="Texto do roteiro">${esc(state.body).replace(/\n/g,'<br>')}</div>`);
      const palette = ['#39FF14','#FF5F1F','#FF10F0','#00FFFF','#FFFF33','#BF00FF'];
      redact(`<div class="redact editor-tags">${parseScript().tags.map((tag,index) => `<strong><span>${esc(tag)}</span><span class="tag-palette">${palette.map((color) => `<button type="button" class="tag-swatch" data-tag-index="${index}" data-color="${color}" style="background:${color}" aria-label="Selecionar cor"></button>`).join('')}<input type="color" data-custom-tag="${index}" value="${state.tagColors[index]}" aria-label="Escolher outra cor"></span></strong>`).join('')}</div>`);
      redact(`<div class="redact editor-style"><span class="${state.bold?'selected':''}">Negrito</span><span class="${state.uppercase?'selected':''}">Caixa alta</span><span>PPM ${state.baseWpm}</span></div>`);
      hotspot('toggle-bold','Alternar negrito',5,92,25,6); hotspot('toggle-uppercase','Alternar caixa alta',31,92,30,6);
      hotspot('wpm-down','Diminuir velocidade base',61,92,15,6); hotspot('wpm-up','Aumentar velocidade base',77,92,18,6);
    } else if (screen === 10) {
      hint = 'Anotações recebidas do Display Diretor ficam reunidas por roteiro e podem ser compartilhadas ou excluídas.';
      hotspot('annotations-back','Voltar aos roteiros',3,6,16,8); hotspot('share-annotations','Compartilhar anotações',68,6,28,8); hotspot('delete-all-notes','Excluir todas as anotações',48,6,18,8);
      state.annotations.forEach((note,index) => hotspot(`delete-note-${index}`,'Excluir anotação',84,20+index*13,12,8));
      if (state.confirmDeleteAll) { redact('<div class="redact confirm-dialog"><strong>Excluir todas as anotações?</strong><span>Excluir tudo</span><span>Cancelar</span></div>'); hotspot('confirm-delete-all','Confirmar exclusão',28,50,44,8); hotspot('cancel-delete-all','Cancelar exclusão',28,60,44,8); }
      redact(`<div class="redact custom-screen"><header><button>‹</button><strong>${esc(state.title)}</strong><button>⇧</button></header><h2>Anotações do diretor</h2>${state.annotations.length ? state.annotations.map((note,index) => `<article><small>Hoje · 16:${String(20+index).padStart(2,'0')}</small><p>${esc(note)}</p></article>`).join('') : '<p>Nenhuma anotação salva.</p>'}<button class="share-note">Compartilhar anotações</button></div>`);
      caption = 'Anotações do diretor';
    } else if (screen === 11) {
      hint = 'Pastas organizam seus roteiros. Toque numa pasta para abri-la ou crie uma nova.';
      hotspot('folders-back','Voltar aos roteiros',3,6,18,8); hotspot('folder-add','Nova pasta',78,6,18,8);
      state.folders.forEach((folder,index) => { hotspot(`open-folder-${index}`,'Abrir pasta',8,22+index*9,68,7); hotspot(`remove-folder-${index}`,'Excluir pasta',78,22+index*9,18,7); });
      redact(`<div class="redact custom-screen"><header><button>‹</button><strong>Pastas</strong><button>＋</button></header>${state.folders.length ? state.folders.map((folder) => `<article class="folder-row">📁 &nbsp; ${esc(folder)}</article>`).join('') : '<p>Nenhuma pasta criada.</p>'}</div>`);
      caption = 'Pastas de roteiros';
    } else if (screen === 12) {
      hint = 'Digite o nome da pasta e salve.';
      hotspot('save-folder','Salvar pasta',65,6,31,8); hotspot('cancel-folder','Cancelar',3,6,25,8);
      redact(`<div class="redact custom-screen"><header><button>Cancelar</button><strong>Nova pasta</strong><button>Salvar</button></header><label>Nome da pasta</label><div class="folder-name" contenteditable="true" role="textbox" aria-label="Nome da pasta">${esc(state.folderName)}</div></div>`);
      caption = 'Criar pasta';
    }
    demoHint.textContent = hint;
    demoCaption.textContent = caption;
  };

  demoHotspots.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'open-scripts') { state.newScript = false; go(4); }
    if (action === 'choose-display') { state.role = ''; go(3); }
    if (action === 'role-camera') { state.role = 'Câmera (TP)'; render(); }
    if (action === 'role-director') { state.role = 'Diretor (preview)'; render(); }
    if (action === 'continue' && state.role) go(4);
    if (action === 'back-connect') { if (state.currentFolder) { state.currentFolder = null; render(); } else go(2); }
    if (action === 'manage-displays') go(2);
    if (action === 'open-script') { state.newScript = false; go(5); }
    if (action === 'script-actions') go(8);
    if (action === 'add-menu') { state.addMenu = true; render(); }
    if (action === 'close-add-menu') { state.addMenu = false; render(); }
    if (action === 'add-script-option') { state.addMenu = false; state.newScript = true; state.title = 'NOVO ROTEIRO'; state.body = ''; state.scriptFolder = state.currentFolder; go(9); }
    if (action === 'add-folder-option' || action === 'folder-add') { state.addMenu = false; state.folderName = 'Nova pasta'; go(12); }
    if (action === 'open-folders') go(11);
    if (action === 'open-annotations') go(10);
    if (action === 'annotations-back' || action === 'folders-back') go(4);
    if (action === 'open-folder-' || action.startsWith('open-folder-')) { const index = Number(action.slice('open-folder-'.length)); state.currentFolder = state.folders[index]; go(4); }
    if (action.startsWith('remove-folder-')) { const index = Number(action.slice('remove-folder-'.length)); const removed = state.folders[index]; state.folders.splice(index,1); if (state.currentFolder === removed) state.currentFolder = null; render(); }
    if (action === 'save-folder') { const input = demoRedactions.querySelector('.folder-name'); const name = input?.innerText.trim(); if (name) state.folders.push(name); state.currentFolder = null; go(11); }
    if (action === 'cancel-folder') go(11);
    if (action.startsWith('delete-note-')) { state.annotations.splice(Number(action.slice('delete-note-'.length)),1); render(); }
    if (action === 'delete-all-notes') { state.confirmDeleteAll = true; render(); }
    if (action === 'confirm-delete-all') { state.annotations = []; state.confirmDeleteAll = false; go(4); }
    if (action === 'cancel-delete-all') { state.confirmDeleteAll = false; render(); }
    if (action === 'share-annotations') { const text = state.annotations.join('\n'); if (navigator.share) navigator.share({ title:'Anotações do diretor', text }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(text); }
    if (action === 'edit-from-menu') { state.newScript = false; go(9); }
    if (action === 'delete-demo') { state.deleted = true; go(4); }
    if (action === 'back-scripts') go(4);
    if (action === 'tags') go(6);
    if (action === 'back-reading') go(5);
    if (action.startsWith('select-tag-')) { state.selectedTag = Number(action.slice('select-tag-'.length)); state.progress = Math.round(state.selectedTag / Math.max(1, parseScript().tags.length - 1) * 100); go(5); }
    if (action === 'format') go(7);
    if (action === 'ready') go(5);
    if (action === 'save') {
      const title = demoRedactions.querySelector('.editor-title');
      const copy = demoRedactions.querySelector('.editor-copy');
      if (title) state.title = title.innerText.trim() || 'NOVO ROTEIRO';
      if (copy) state.body = copy.innerText.trim();
      state.newScript = false; state.deleted = false; state.scriptFolder = state.currentFolder; go(4);
    }
    if (action === 'cancel') go(4);
    if (action === 'mode-auto') { state.mode = 'Automático'; if (state.playing) { clearPlayback(); state.playing = true; } render(); if (state.playing) startPlayback(); }
    if (action === 'mode-manual') { state.mode = 'Manual'; clearPlayback(); render(); }
    if (action === 'speed-down') { state.speed = Math.max(10,state.speed-5); render(); }
    if (action === 'speed-up') { state.speed = Math.min(100,state.speed+5); render(); }
    if (action === 'reset') { clearPlayback(); state.progress = 0; state.elapsed = 0; render(); }
    if (action === 'reverse') { state.progress = Math.max(0,state.progress-10); state.elapsed = Math.max(0,state.elapsed-8); render(); }
    if (action === 'font-up') { state.fontSize = Math.min(160,state.fontSize+10); render(); }
    if (action === 'font-down') { state.fontSize = Math.max(60,state.fontSize-10); render(); }
    if (action === 'align-left') { state.alignment='Esquerda'; render(); }
    if (action === 'align-center') { state.alignment='Centro'; render(); }
    if (action === 'align-right') { state.alignment='Direita'; render(); }
    if (action === 'mirror-x') { state.mirrorX=!state.mirrorX; render(); }
    if (action === 'mirror-y') { state.mirrorY=!state.mirrorY; render(); }
    if (action === 'background-color') { state.background=state.background==='Preto'?'Branco':'Preto'; render(); }
    if (action === 'text-color') { state.textColor=state.textColor==='Branco'?'Amarelo':'Branco'; render(); }
    if (action === 'toggle-bold' || action === 'toggle-uppercase' || action === 'wpm-down' || action === 'wpm-up') {
      const title = demoRedactions.querySelector('.editor-title'); const copy = demoRedactions.querySelector('.editor-copy');
      if (title) state.title = title.innerText.trim(); if (copy) state.body = copy.innerText;
      if (action === 'toggle-bold') state.bold = !state.bold;
      if (action === 'toggle-uppercase') state.uppercase = !state.uppercase;
      if (action === 'wpm-down') state.baseWpm = Math.max(40, state.baseWpm - 10);
      if (action === 'wpm-up') state.baseWpm = Math.min(260, state.baseWpm + 10);
      render();
    }
    if (action.startsWith('tag-color-')) {
      const index=Number(action.slice(-1)); const palette=['#35ee27','#ff5722','#ed00df','#00d9e8','#f7ed22','#ad00ed'];
      state.tagColors[index]=palette[(palette.indexOf(state.tagColors[index])+1+palette.length)%palette.length];
      const swatch=demoRedactions.querySelectorAll('.editor-tags i')[index]; if (swatch) swatch.style.background=state.tagColors[index];
    }
    if (action === 'play') { if (state.playing) clearPlayback(); else state.playing = true; render(); if (state.playing) startPlayback(); }
  });
  const startPlayback = () => {
    clearInterval(playbackTimer); playbackTimer = null;
    if (!state.playing || state.mode !== 'Automático') return;
    playbackTimer = setInterval(() => {
      state.progress = Math.min(100, state.progress + 1); state.elapsed += 1;
      const reading = demoRedactions.querySelector('.reading'); if (reading) reading.scrollTop += 1;
      const fill = demoRedactions.querySelector('.demo-progress span'); if (fill) fill.style.width = `${state.progress}%`;
      const clock = demoRedactions.querySelector('.demo-time'); if (clock) clock.textContent = `${String(Math.floor(state.elapsed/60)).padStart(2,'0')}:${String(state.elapsed%60).padStart(2,'0')}`;
      if (state.progress >= 100) { clearPlayback(); render(); }
    }, Math.max(200, 1000 - state.speed * 8));
  };
  demoRedactions.addEventListener('click', (event) => {
    const swatch = event.target.closest('[data-tag-index][data-color]');
    if (!swatch) return;
    const index = Number(swatch.dataset.tagIndex); state.tagColors[index] = swatch.dataset.color;
    demoRedactions.querySelectorAll(`.tag-swatch[data-tag-index="${index}"]`).forEach((button) => button.classList.toggle('chosen', button === swatch));
  });
  demoRedactions.addEventListener('input', (event) => {
    const picker = event.target.closest('[data-custom-tag]'); if (!picker) return;
    const index = Number(picker.dataset.customTag); state.tagColors[index] = picker.value;
  });
  demoRedactions.addEventListener('scroll', (event) => {
    const reader = event.target.closest('.reading');
    if (!reader || state.mode !== 'Manual') return;
    const range = reader.scrollHeight - reader.clientHeight;
    if (range > 0) {
      state.progress = Math.round(reader.scrollTop / range * 100);
      const fill = demoRedactions.querySelector('.demo-progress span');
      if (fill) fill.style.width = `${state.progress}%`;
    }
  }, true);
  render();
}
