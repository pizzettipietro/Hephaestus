// ===================================================
// 1. DADOS (salvar e carregar do localStorage)
// ===================================================

// Nome da "gaveta" onde os dados ficam guardados no navegador
const CHAVE = 'meu-treino-dados';

// Carrega os dados salvos (ou cria vazios na primeira vez)
let dados = carregar();

// Quem já tinha dados salvos de antes não tem esse campo novo: cria ele
if (!dados.marcadosHoje) dados.marcadosHoje = [];

function carregar() {
  const texto = localStorage.getItem(CHAVE);
  if (texto) {
    return JSON.parse(texto); // texto → objeto
  }
  // Primeira vez abrindo o app: começa tudo vazio
  return {
    exercicios: [],
    treinos: [],
    treinoAtual: 0,
    marcadosHoje: [], // ids dos exercícios já marcados no treino em andamento
    historico: [],
    ultimoBackup: null
  };
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados)); // objeto → texto
  } catch (erro) {
    // Acontece se o localStorage encher (limite de ~5 MB)
    abrirPopup({
      titulo: 'Memória cheia',
      texto: 'Não deu pra salvar. Tente remover algumas fotos de exercícios.',
      soAviso: true
    });
  }
}

// Data de hoje no fuso do celular, no formato "2026-11-11"
// (o toISOString() usa o horário de Londres: depois das 21h no Brasil já daria o dia seguinte)
function dataDeHoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mes + '-' + dia;
}

// Gera um número único pra identificar cada exercício/treino
function novoId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// Procura um exercício pelo id
function buscarExercicio(id) {
  return dados.exercicios.find(function (ex) { return ex.id === id; });
}


// ===================================================
// 2. NAVEGAÇÃO ENTRE AS TELAS
// ===================================================

const botoesMenu = document.querySelectorAll('nav button');

botoesMenu.forEach(function (botao) {
  botao.addEventListener('click', function () {
    mostrarTela(botao.dataset.tela);
  });
});

function mostrarTela(idDaTela) {
  document.querySelectorAll('.tela').forEach(function (tela) {
    tela.classList.remove('ativa');
  });
  document.getElementById(idDaTela).classList.add('ativa');

  botoesMenu.forEach(function (botao) {
    botao.classList.toggle('ativo', botao.dataset.tela === idDaTela);
  });
}


// ===================================================
// 3. FUNÇÕES DE AJUDA PRA MONTAR A TELA
// ===================================================

// Cria um botão pequeno com um texto e uma ação
function criarBotao(texto, classe, acao) {
  const botao = document.createElement('button');
  botao.textContent = texto;
  botao.className = classe;
  botao.addEventListener('click', acao);
  return botao;
}

// Mostra um aviso cinza quando a lista está vazia
function mensagemVazia(lista, texto) {
  const li = document.createElement('li');
  li.className = 'vazio';
  li.textContent = texto;
  lista.appendChild(li);
}


// ===================================================
// 3.1 POPUP
// ===================================================
// Um único popup reaproveitado pra tudo. Você chama abrirPopup()
// passando o que quer mostrar e o que fazer quando apertar o botão.
//
// Exemplos:
//   abrirPopup({ titulo: 'Excluir?', perigo: true, aoConfirmar: function () {...} })
//   abrirPopup({ titulo: 'Editar', valor: 'Supino', aoConfirmar: function (novoNome) {...} })

const popupFundo = document.getElementById('popup-fundo');
const popupTitulo = document.getElementById('popup-titulo');
const popupTexto = document.getElementById('popup-texto');
const popupInput = document.getElementById('popup-input');
const popupConfirmar = document.getElementById('popup-confirmar');
const popupCancelar = document.getElementById('popup-cancelar');

let acaoDoPopup = null; // guarda a função que roda ao confirmar
let popupTemCampo = false;

function abrirPopup(opcoes) {
  popupTitulo.textContent = opcoes.titulo;

  // Texto explicativo (opcional)
  popupTexto.textContent = opcoes.texto || '';
  popupTexto.classList.toggle('escondido', !opcoes.texto);

  // Campo de texto: só aparece se passar um "valor" (modo editar)
  popupTemCampo = opcoes.valor !== undefined;
  popupInput.classList.toggle('escondido', !popupTemCampo);
  popupInput.value = popupTemCampo ? opcoes.valor : '';

  // Botão de confirmar: texto e cor
  popupConfirmar.textContent = opcoes.botao || 'OK';
  popupConfirmar.classList.toggle('vermelho', opcoes.perigo === true);

  // soAviso: true → esconde o "Cancelar" (popup só pra informar algo)
  popupCancelar.classList.toggle('escondido', opcoes.soAviso === true);

  acaoDoPopup = opcoes.aoConfirmar;
  popupFundo.classList.remove('escondido');

  if (popupTemCampo) {
    popupInput.focus();
    popupInput.select(); // seleciona o texto pra facilitar trocar
  }
}

function fecharPopup() {
  popupFundo.classList.add('escondido');
  acaoDoPopup = null;
}

function confirmarPopup() {
  const valor = popupInput.value.trim();
  if (popupTemCampo && valor === '') return; // não deixa salvar nome vazio

  const acao = acaoDoPopup;
  fecharPopup();
  if (acao) acao(valor);
}

popupConfirmar.addEventListener('click', confirmarPopup);
popupCancelar.addEventListener('click', fecharPopup);

// Tocar no fundo escuro (fora da caixinha) também fecha
popupFundo.addEventListener('click', function (evento) {
  if (evento.target === popupFundo) fecharPopup();
});

// Apertar Enter no campo de texto = confirmar
popupInput.addEventListener('keydown', function (evento) {
  if (evento.key === 'Enter') confirmarPopup();
});


// ===================================================
// 4. EXERCÍCIOS
// ===================================================

const formExercicio = document.getElementById('form-exercicio');
const inputExercicio = document.getElementById('input-exercicio');
const inputSeries = document.getElementById('input-series');
const inputReps = document.getElementById('input-reps');
const inputFoto = document.getElementById('input-foto');
const previewFoto = document.getElementById('preview-foto');
const fotoPlaceholder = document.getElementById('foto-placeholder');
const btnRemoverFoto = document.getElementById('btn-remover-foto');
const btnSalvarExercicio = document.getElementById('btn-salvar-exercicio');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
const listaExercicios = document.getElementById('lista-exercicios');

let fotoAtual = null;         // foto escolhida no formulário (como texto "data:image/...")
let exercicioEditando = null; // id do exercício sendo editado (null = adicionando um novo)

// --- Foto ---

// Quando você escolhe uma foto, ela é reduzida e mostrada no quadrado
inputFoto.addEventListener('change', function () {
  const arquivo = inputFoto.files[0];
  if (!arquivo) return;

  reduzirImagem(arquivo, function (fotoReduzida) {
    fotoAtual = fotoReduzida;
    mostrarPreviewFoto();
  });

  inputFoto.value = ''; // permite escolher a mesma foto de novo depois
});

btnRemoverFoto.addEventListener('click', function () {
  fotoAtual = null;
  mostrarPreviewFoto();
});

// Diminui a foto pra no máximo 200px e transforma em texto (pra caber no localStorage)
function reduzirImagem(arquivo, quandoTerminar) {
  const img = new Image();

  img.onload = function () {
    const TAMANHO_MAX = 200;
    const escala = Math.min(1, TAMANHO_MAX / Math.max(img.width, img.height));

    // Desenha a foto menor num "canvas" (uma tela de desenho invisível)
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

    URL.revokeObjectURL(img.src); // libera a foto original da memória

    // Exporta como JPEG com 70% de qualidade → fica bem leve
    quandoTerminar(canvas.toDataURL('image/jpeg', 0.7));
  };

  img.src = URL.createObjectURL(arquivo);
}

function mostrarPreviewFoto() {
  if (fotoAtual) {
    previewFoto.src = fotoAtual;
    previewFoto.classList.remove('escondido');
    fotoPlaceholder.classList.add('escondido');
    btnRemoverFoto.classList.remove('escondido');
  } else {
    previewFoto.removeAttribute('src');
    previewFoto.classList.add('escondido');
    fotoPlaceholder.classList.remove('escondido');
    btnRemoverFoto.classList.add('escondido');
  }
}

// Cria a fotinha das listas (ou um ícone se o exercício não tem foto)
function criarMiniatura(foto) {
  if (foto) {
    const img = document.createElement('img');
    img.className = 'miniatura';
    img.src = foto;
    img.alt = '';
    return img;
  }
  const semFoto = document.createElement('div');
  semFoto.className = 'miniatura';
  semFoto.textContent = '🏋️';
  return semFoto;
}

// --- Adicionar / Salvar ---

formExercicio.addEventListener('submit', function (evento) {
  evento.preventDefault(); // ← impede a página de recarregar

  const nome = inputExercicio.value.trim();
  if (nome === '') return;

  // Séries e reps são texto livre: aceita "4", "3-4", "8-12", "até a falha"...
  const series = inputSeries.value.trim();
  const reps = inputReps.value.trim();

  if (exercicioEditando !== null) {
    // Modo EDITAR: atualiza o exercício existente
    const exercicio = buscarExercicio(exercicioEditando);
    exercicio.nome = nome;
    exercicio.series = series;
    exercicio.reps = reps;
    exercicio.foto = fotoAtual;
  } else {
    // Modo ADICIONAR: cria um novo
    dados.exercicios.push({
      id: novoId(),
      nome: nome,
      series: series,
      reps: reps,
      foto: fotoAtual
    });
  }

  salvar();
  limparFormulario();
  atualizarTela();
});

btnCancelarEdicao.addEventListener('click', limparFormulario);

function limparFormulario() {
  formExercicio.reset(); // limpa todos os campos
  fotoAtual = null;
  mostrarPreviewFoto();

  exercicioEditando = null;
  btnSalvarExercicio.textContent = 'Adicionar';
  btnCancelarEdicao.classList.add('escondido');
}

// --- Lista ---

function renderizarExercicios() {
  listaExercicios.innerHTML = ''; // apaga a lista antiga

  if (dados.exercicios.length === 0) {
    mensagemVazia(listaExercicios, 'Nenhum exercício cadastrado ainda.');
    return;
  }

  dados.exercicios.forEach(function (exercicio) {
    const li = document.createElement('li');

    li.appendChild(criarMiniatura(exercicio.foto));

    // Nome + linha pequena com séries e reps embaixo
    const nome = document.createElement('span');
    nome.textContent = exercicio.nome;
    const detalhe = textoSeriesReps(exercicio);
    if (detalhe) {
      const sub = document.createElement('small');
      sub.className = 'sub';
      sub.textContent = detalhe;
      nome.appendChild(sub);
    }
    li.appendChild(nome);

    li.appendChild(criarBotao('✏️', 'pequeno', function () {
      editarExercicio(exercicio.id);
    }));
    li.appendChild(criarBotao('✕', 'perigo', function () {
      excluirExercicio(exercicio.id);
    }));

    listaExercicios.appendChild(li);
  });
}

// Ex: "4 séries × 12 reps" (ou só o que estiver preenchido)
function textoSeriesReps(exercicio) {
  const partes = [];
  if (exercicio.series) partes.push(exercicio.series + ' séries');
  if (exercicio.reps) partes.push(exercicio.reps + ' reps');
  return partes.join(' × ');
}

// --- Editar ---

// Joga os dados do exercício no formulário lá em cima
function editarExercicio(id) {
  const exercicio = buscarExercicio(id);
  exercicioEditando = id;

  inputExercicio.value = exercicio.nome;
  inputSeries.value = exercicio.series || '';
  inputReps.value = exercicio.reps || '';
  fotoAtual = exercicio.foto || null;
  mostrarPreviewFoto();

  btnSalvarExercicio.textContent = 'Salvar';
  btnCancelarEdicao.classList.remove('escondido');

  formExercicio.scrollIntoView({ behavior: 'smooth' });
}

// --- Excluir ---

function excluirExercicio(id) {
  const exercicio = buscarExercicio(id);

  abrirPopup({
    titulo: 'Excluir "' + exercicio.nome + '"?',
    texto: 'Ele também sai de todos os treinos.',
    botao: 'Excluir',
    perigo: true,
    aoConfirmar: function () {
      // Remove da lista de exercícios
      dados.exercicios = dados.exercicios.filter(function (ex) { return ex.id !== id; });

      // Remove também de dentro de cada treino
      dados.treinos.forEach(function (treino) {
        treino.exercicios = treino.exercicios.filter(function (exId) { return exId !== id; });
      });

      if (exercicioEditando === id) limparFormulario();

      salvar();
      atualizarTela();
    }
  });
}


// ===================================================
// 5. TREINOS
// ===================================================

const formTreino = document.getElementById('form-treino');
const inputTreino = document.getElementById('input-treino');
const listaTreinos = document.getElementById('lista-treinos');

formTreino.addEventListener('submit', function (evento) {
  evento.preventDefault(); // ← impede a página de recarregar

  const nome = inputTreino.value.trim();
  if (nome === '') return;

  dados.treinos.push({ id: novoId(), nome: nome, exercicios: [] });
  salvar();

  inputTreino.value = '';
  atualizarTela();
});

function renderizarTreinos() {
  listaTreinos.innerHTML = '';

  if (dados.treinos.length === 0) {
    mensagemVazia(listaTreinos, 'Nenhum treino criado ainda.');
    return;
  }

  // "indice" é a posição na lista: 0, 1, 2... (é a ordem da rotação)
  dados.treinos.forEach(function (treino, indice) {
    const li = document.createElement('li');

    const nome = document.createElement('span');
    nome.textContent = treino.nome + ' (' + treino.exercicios.length + ' exercícios)';
    li.appendChild(nome);

    li.appendChild(criarBotao('↑', 'pequeno', function () { moverTreino(indice, -1); }));
    li.appendChild(criarBotao('↓', 'pequeno', function () { moverTreino(indice, +1); }));
    li.appendChild(criarBotao('✏️', 'pequeno', function () { abrirEditor(treino.id); }));
    li.appendChild(criarBotao('✕', 'perigo', function () { excluirTreino(treino.id); }));

    listaTreinos.appendChild(li);
  });
}

// Troca o treino de lugar com o vizinho (muda a ordem da rotação)
function moverTreino(indice, direcao) {
  const novoIndice = indice + direcao;
  if (novoIndice < 0 || novoIndice >= dados.treinos.length) return; // já está na ponta

  const temp = dados.treinos[indice];
  dados.treinos[indice] = dados.treinos[novoIndice];
  dados.treinos[novoIndice] = temp;

  salvar();
  atualizarTela();
}

function buscarTreino(id) {
  return dados.treinos.find(function (t) { return t.id === id; });
}

function excluirTreino(id) {
  const treino = buscarTreino(id);

  abrirPopup({
    titulo: 'Excluir "' + treino.nome + '"?',
    texto: 'Os exercícios continuam cadastrados.',
    botao: 'Excluir',
    perigo: true,
    aoConfirmar: function () {
      dados.treinos = dados.treinos.filter(function (t) { return t.id !== id; });

      // Se o treino do dia apontava pra uma posição que não existe mais, volta pro primeiro
      if (dados.treinoAtual >= dados.treinos.length) {
        dados.treinoAtual = 0;
      }
      if (treinoEditando === id) fecharEditor();

      salvar();
      atualizarTela();
    }
  });
}

function renomearTreino() {
  const treino = buscarTreino(treinoEditando);

  abrirPopup({
    titulo: 'Renomear treino',
    valor: treino.nome,
    botao: 'Salvar',
    aoConfirmar: function (novoNome) {
      treino.nome = novoNome;
      salvar();
      atualizarTela();
    }
  });
}


// ===================================================
// 6. EDITOR DE TREINO (escolher os exercícios dele)
// ===================================================

const editor = document.getElementById('editor-treino');
const editorTitulo = document.getElementById('editor-titulo');
const editorExercicios = document.getElementById('editor-exercicios');
let treinoEditando = null; // id do treino aberto no editor

document.getElementById('btn-fechar-editor').addEventListener('click', fecharEditor);
document.getElementById('btn-renomear-treino').addEventListener('click', renomearTreino);

function abrirEditor(id) {
  treinoEditando = id;
  editor.classList.remove('escondido');
  renderizarEditor();
  editor.scrollIntoView({ behavior: 'smooth' }); // rola a tela até o editor
}

function fecharEditor() {
  treinoEditando = null;
  editor.classList.add('escondido');
}

function renderizarEditor() {
  if (treinoEditando === null) return;

  const treino = buscarTreino(treinoEditando);
  editorTitulo.textContent = treino.nome;
  editorExercicios.innerHTML = '';

  if (dados.exercicios.length === 0) {
    mensagemVazia(editorExercicios, 'Cadastre exercícios lá em cima primeiro.');
    return;
  }

  // Uma checkbox pra cada exercício cadastrado
  dados.exercicios.forEach(function (exercicio) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = treino.exercicios.includes(exercicio.id); // já faz parte do treino?

    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        treino.exercicios.push(exercicio.id); // adiciona ao treino
      } else {
        treino.exercicios = treino.exercicios.filter(function (id) { return id !== exercicio.id; });
      }
      salvar();
      renderizarTreinos(); // atualiza o "(X exercícios)"
    });

    const nome = document.createElement('span');
    nome.textContent = exercicio.nome;

    li.appendChild(checkbox);
    li.appendChild(criarMiniatura(exercicio.foto));
    li.appendChild(nome);
    editorExercicios.appendChild(li);
  });
}


// ===================================================
// 7. TELA HOJE (treino do dia)
// ===================================================

const selectTreino = document.getElementById('select-treino');
const progressoHoje = document.getElementById('progresso-hoje');
const listaHoje = document.getElementById('lista-hoje');
const botoesHoje = document.getElementById('botoes-hoje');

// Pega o treino que está na vez (ou undefined se não tem nenhum)
function treinoDeHoje() {
  return dados.treinos[dados.treinoAtual];
}

function renderizarHoje() {
  // --- 1. Preenche o seletor com todos os treinos ---
  selectTreino.innerHTML = '';

  if (dados.treinos.length === 0) {
    const opcao = document.createElement('option');
    opcao.textContent = 'Nenhum treino criado';
    selectTreino.appendChild(opcao);
    selectTreino.disabled = true;

    listaHoje.innerHTML = '';
    mensagemVazia(listaHoje, 'Crie seus treinos na aba Treinos 📋');
    progressoHoje.textContent = '';
    botoesHoje.classList.add('escondido');
    return;
  }

  selectTreino.disabled = false;
  dados.treinos.forEach(function (treino, indice) {
    const opcao = document.createElement('option');
    opcao.value = indice;            // a posição na rotação
    opcao.textContent = treino.nome;
    selectTreino.appendChild(opcao);
  });
  selectTreino.value = dados.treinoAtual; // deixa selecionado o da vez

  // --- 2. Lista os exercícios do treino com checkbox ---
  const treino = treinoDeHoje();
  listaHoje.innerHTML = '';

  if (treino.exercicios.length === 0) {
    mensagemVazia(listaHoje, 'Este treino ainda não tem exercícios. Adicione na aba Treinos ✏️');
    progressoHoje.textContent = '';
    botoesHoje.classList.add('escondido');
    return;
  }

  botoesHoje.classList.remove('escondido');

  treino.exercicios.forEach(function (exId) {
    const exercicio = buscarExercicio(exId);
    const feito = dados.marcadosHoje.includes(exId);

    const li = document.createElement('li');
    if (feito) li.classList.add('feito');

    // <label> em volta: tocar em qualquer parte da linha marca a checkbox
    const label = document.createElement('label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = feito;
    checkbox.addEventListener('change', function () {
      marcarExercicio(exId, checkbox.checked);
    });

    const nome = document.createElement('span');
    nome.textContent = exercicio.nome;

    // Ordem: Foto, Nome, Série, Reps, Checkbox
    label.appendChild(criarMiniatura(exercicio.foto));
    label.appendChild(nome);
    label.appendChild(criarInfo(exercicio.series, 'séries'));
    label.appendChild(criarInfo(exercicio.reps, 'reps'));
    label.appendChild(checkbox);
    li.appendChild(label);
    listaHoje.appendChild(li);
  });

  // --- 3. Mostra quantos já foram feitos ---
  const total = treino.exercicios.length;
  const feitos = exerciciosFeitos().length;
  progressoHoje.textContent = feitos + ' de ' + total + ' exercícios feitos';
}

// Bloquinho com o número grande e a legenda pequena embaixo (ex: "4 / séries")
function criarInfo(valor, legenda) {
  const div = document.createElement('div');
  div.className = 'info';

  const numero = document.createElement('strong');
  numero.textContent = valor || '–'; // mostra "–" se não foi preenchido

  const texto = document.createElement('small');
  texto.textContent = legenda;

  div.appendChild(numero);
  div.appendChild(texto);
  return div;
}

// Só os marcados que realmente fazem parte do treino de hoje
function exerciciosFeitos() {
  const treino = treinoDeHoje();
  return dados.marcadosHoje.filter(function (id) {
    return treino.exercicios.includes(id);
  });
}

function marcarExercicio(id, marcado) {
  if (marcado) {
    dados.marcadosHoje.push(id);
  } else {
    dados.marcadosHoje = dados.marcadosHoje.filter(function (x) { return x !== id; });
  }
  salvar(); // salva na hora: se o app fechar no meio do treino, nada se perde
  renderizarHoje();
}

// --- Trocar o treino pelo seletor ---
selectTreino.addEventListener('change', function () {
  dados.treinoAtual = Number(selectTreino.value);
  dados.marcadosHoje = []; // começa o novo treino sem nada marcado
  salvar();
  renderizarHoje();
});

// --- Marcar todos ---
document.getElementById('btn-marcar-todos').addEventListener('click', function () {
  dados.marcadosHoje = treinoDeHoje().exercicios.slice(); // copia todos os ids
  salvar();
  renderizarHoje();
});

// --- Concluir treino ---
document.getElementById('btn-concluir').addEventListener('click', function () {
  if (exerciciosFeitos().length === 0) {
    abrirPopup({
      titulo: 'Nenhum exercício marcado',
      texto: 'Quer concluir o treino mesmo assim?',
      botao: 'Concluir',
      aoConfirmar: concluirTreino
    });
  } else {
    concluirTreino();
  }
});

function concluirTreino() {
  const treino = treinoDeHoje();
  const feitos = exerciciosFeitos();

  // 1. Guarda no histórico (vai servir pra aba de Progresso no futuro)
  dados.historico.push({
    data: dataDeHoje(), // ex: "2026-11-11"
    treino: treino.id,
    nomeTreino: treino.nome,
    feitos: feitos,
    total: treino.exercicios.length
  });

  // 2. Passa pro próximo treino. O "%" faz voltar pro 0 depois do último (A → B → C → A)
  dados.treinoAtual = (dados.treinoAtual + 1) % dados.treinos.length;

  // 3. Limpa as marcações
  dados.marcadosHoje = [];

  salvar();
  renderizarHoje();

  abrirPopup({
    titulo: 'Treino concluído! 💪',
    texto: feitos.length + ' de ' + treino.exercicios.length + ' exercícios feitos. Próximo: ' + treinoDeHoje().nome,
    botao: 'Boa!',
    soAviso: true
  });
}


// ===================================================
// 8. BACKUP (exportar e importar)
// ===================================================

const infoBackup = document.getElementById('info-backup');
const inputImportar = document.getElementById('input-importar');
const btnCompartilhar = document.getElementById('btn-compartilhar');

// --- Mostra quando foi o último backup ---
function renderizarBackup() {
  if (!dados.ultimoBackup) {
    infoBackup.textContent = '⚠️ Nenhum backup feito ainda.';
    infoBackup.classList.add('atrasado');
    return;
  }

  // Conta quantos dias se passaram desde o último backup
  const hoje = new Date(dataDeHoje());
  const ultimo = new Date(dados.ultimoBackup);
  const dias = Math.round((hoje - ultimo) / (1000 * 60 * 60 * 24));

  let texto;
  if (dias === 0) texto = 'hoje';
  else if (dias === 1) texto = 'ontem';
  else texto = 'há ' + dias + ' dias';

  infoBackup.textContent = (dias > 7 ? '⚠️ ' : '✅ ') + 'Último backup: ' + texto;
  infoBackup.classList.toggle('atrasado', dias > 7); // amarelo se passou de 1 semana
}

// --- Monta o arquivo de backup ---
function criarArquivoBackup() {
  dados.ultimoBackup = dataDeHoje(); // marca a data antes de exportar
  salvar();

  // Junto com os dados vai uma "etiqueta" dizendo de que app é o arquivo
  const conteudo = {
    app: 'Hephaestus',
    versaoBackup: 1,
    exportadoEm: new Date().toISOString(),
    dados: dados
  };

  const texto = JSON.stringify(conteudo, null, 2); // o 2 deixa o arquivo legível
  const nome = 'hephaestus-backup-' + dataDeHoje() + '.json';

  // File = um arquivo criado na memória, sem precisar existir no disco
  return new File([texto], nome, { type: 'application/json' });
}

// --- Exportar: baixa o arquivo ---
document.getElementById('btn-exportar').addEventListener('click', function () {
  const arquivo = criarArquivoBackup();

  // Truque clássico pra baixar: cria um link invisível apontando
  // pro arquivo, clica nele pelo código e depois joga fora
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = arquivo.name;
  link.click();
  URL.revokeObjectURL(url);

  renderizarBackup();
  abrirPopup({
    titulo: 'Backup exportado ✅',
    texto: 'O arquivo "' + arquivo.name + '" foi salvo na pasta de downloads.',
    soAviso: true
  });
});

// --- Enviar: abre o menu de compartilhar do celular ---
// navigator.canShare verifica se o aparelho consegue compartilhar arquivos
const testeArquivo = new File(['{}'], 'teste.json', { type: 'application/json' });
if (navigator.canShare && navigator.canShare({ files: [testeArquivo] })) {
  btnCompartilhar.classList.remove('escondido');
}

btnCompartilhar.addEventListener('click', function () {
  const arquivo = criarArquivoBackup();
  renderizarBackup();

  navigator.share({ files: [arquivo], title: 'Backup Hephaestus' })
    .catch(function () {
      // Cai aqui se você fechar o menu sem escolher nada: não precisa fazer nada
    });
});

// --- Importar: lê o arquivo escolhido ---
inputImportar.addEventListener('change', function () {
  const arquivo = inputImportar.files[0];
  inputImportar.value = ''; // permite escolher o mesmo arquivo de novo depois
  if (!arquivo) return;

  // FileReader = lê o conteúdo de um arquivo escolhido pelo usuário
  const leitor = new FileReader();

  leitor.onload = function () {
    let importado;
    try {
      const conteudo = JSON.parse(leitor.result);
      // Aceita o formato com etiqueta { app, dados } e também os dados "puros"
      importado = conteudo.dados ? conteudo.dados : conteudo;
      validarBackup(importado);
    } catch (erro) {
      abrirPopup({
        titulo: 'Arquivo inválido',
        texto: 'Esse arquivo não é um backup do Hephaestus.',
        soAviso: true
      });
      return;
    }

    // Confirma antes, porque importar SUBSTITUI tudo que está no app
    abrirPopup({
      titulo: 'Restaurar backup?',
      texto: 'O backup tem ' + plural(importado.exercicios.length, 'exercício', 'exercícios') + ' e ' +
             plural(importado.treinos.length, 'treino', 'treinos') +
             '. Tudo que está no app agora será substituído.',
      botao: 'Restaurar',
      perigo: true,
      aoConfirmar: function () {
        restaurarBackup(importado);
      }
    });
  };

  leitor.readAsText(arquivo);
});

// Ex: plural(1, 'treino', 'treinos') → "1 treino" / plural(3, ...) → "3 treinos"
function plural(numero, singular, plural) {
  return numero + ' ' + (numero === 1 ? singular : plural);
}

// Confere se o arquivo tem o formato certo. Se não tiver, "throw" gera um erro
// que cai no "catch" lá em cima
function validarBackup(d) {
  if (!d || !Array.isArray(d.exercicios) || !Array.isArray(d.treinos)) {
    throw new Error('formato inválido');
  }
}

function restaurarBackup(importado) {
  dados = importado;

  // Garante que todos os campos existem (caso o backup seja de uma versão antiga)
  if (!Array.isArray(dados.historico)) dados.historico = [];
  if (!Array.isArray(dados.marcadosHoje)) dados.marcadosHoje = [];
  if (typeof dados.treinoAtual !== 'number' || dados.treinoAtual >= dados.treinos.length) {
    dados.treinoAtual = 0;
  }

  salvar();
  limparFormulario();
  fecharEditor();
  atualizarTela();

  abrirPopup({
    titulo: 'Backup restaurado ✅',
    texto: 'Seus exercícios e treinos estão de volta.',
    soAviso: true
  });
}


// ===================================================
// 9. ATUALIZAR TUDO
// ===================================================

// Redesenha todas as listas com os dados atuais
function atualizarTela() {
  renderizarBackup();
  renderizarHoje();
  renderizarExercicios();
  renderizarTreinos();
  renderizarEditor();
}

// Quando o app abre, desenha tudo pela primeira vez
atualizarTela();


// ===================================================
// 10. PWA (funcionar offline + proteger os dados)
// ===================================================

// Liga o service worker (o sw.js), que guarda o app pra funcionar offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// Pede pro navegador NÃO apagar os dados do app por conta própria
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist();
}
